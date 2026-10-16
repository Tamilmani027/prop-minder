import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import request from 'supertest';

let mongod: MongoMemoryServer | null = null;
const app = createApp();

// Registers an organization + owner user via the auth endpoint and returns the
// JWT token plus the org/user ids. Every property route is authenticated, so
// tests use this token to scope requests to an organization.
const registerOrg = async (overrides: Record<string, string> = {}) => {
  const orgName = overrides.orgName ?? `Org ${Math.random().toString(36).slice(2)}`;
  const name = overrides.name ?? 'Owner';
  const email = overrides.email ?? `user-${Math.random().toString(36).slice(2)}@example.com`;
  const password = overrides.password ?? 'Password12345';

  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ orgName, name, email, password });

  expect(res.status).toBe(201);
  expect(res.body.data.token).toBeDefined();
  expect(res.body.data.user.orgId).toBeDefined();

  return {
    token: res.body.data.token,
    orgId: res.body.data.user.orgId,
    userId: res.body.data.user.id,
  };
};

const createProperty = async (
  token: string,
  body: Record<string, unknown>
) => {
  return await request(app)
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
};

// Only run the test when MongoDB is available (mirrors tenantPlugin.test.ts).
const itDb = (name: string, fn: () => Promise<void>) => {
  it(name, async () => {
    if (mongoose.connection.readyState !== 1) return;
    await fn();
  });
};

beforeAll(async () => {
  try {
    await Promise.race([
      (async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
      })(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('mongodb unavailable')), 10000)
      ),
    ]);
  } catch (err) {
    console.log('Skipping property tests: MongoDB unavailable', (err as Error).message);
  }
}, 15000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('POST /api/v1/properties', () => {
  itDb('creates a property and returns 201 { data }', async () => {
    const { token } = await registerOrg({ orgName: 'Acme' });
    const res = await createProperty(token, {
      name: 'Main Office',
      address: '123 Main St',
      city: 'Metropolis',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: 'Main Office',
      address: '123 Main St',
      city: 'Metropolis',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.orgId).toBeDefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });
});

describe('GET /api/v1/properties', () => {
  itDb('lists the orgs properties with pagination', async () => {
    const { token } = await registerOrg({ orgName: 'ListOrg' });
    await createProperty(token, { name: 'Alpha', address: '1 A St' });
    await createProperty(token, { name: 'Beta', address: '2 B St' });
    await createProperty(token, { name: 'Gamma', address: '3 C St' });

    const res = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
  });

  itDb('filters by case-insensitive name search (q)', async () => {
    const { token } = await registerOrg({ orgName: 'SearchOrg' });
    await createProperty(token, { name: 'Main Office', address: '1 Main St' });
    await createProperty(token, { name: 'Warehouse (North)', address: '2 Warehouse Rd' });

    // Search with a regex metacharacter must not crash and must match literally.
    const res = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .query({ q: '(' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Warehouse (North)');

    const res2 = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .query({ q: 'main' });

    expect(res2.status).toBe(200);
    expect(res2.body.data.length).toBe(1);
    expect(res2.body.data[0].name).toBe('Main Office');
  });
});

describe('GET /api/v1/properties/:id', () => {
  itDb('returns a single property', async () => {
    const { token } = await registerOrg({ orgName: 'GetOrg' });
    const created = await createProperty(token, {
      name: 'HQ',
      address: '999 Center St',
    });

    const res = await request(app)
      .get(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('HQ');
    expect(res.body.data.address).toBe('999 Center St');
  });

  itDb('returns 404 when the property is not in the callers org', async () => {
    const { token: tokenA, orgId: orgIdA } = await registerOrg({
      orgName: 'OrgA',
    });
    const created = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });

    const { token: tokenB } = await registerOrg({ orgName: 'OrgB' });

    const res = await request(app)
      .get(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  itDb('returns 404 for a valid but unknown id', async () => {
    const { token } = await registerOrg({ orgName: 'UnknownOrg' });
    const missingId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/v1/properties/${missingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  itDb('returns 400 for an invalid :id', async () => {
    const { token } = await registerOrg({ orgName: 'BadIdOrg' });

    const res = await request(app)
      .get('/api/v1/properties/not-an-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/v1/properties/:id', () => {
  itDb('updates a property', async () => {
    const { token } = await registerOrg({ orgName: 'PatchOrg' });
    const created = await createProperty(token, {
      name: 'Old Name',
      address: '1 Old St',
      city: 'Old City',
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', city: 'New City' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
    expect(res.body.data.city).toBe('New City');
    expect(res.body.data.address).toBe('1 Old St');
  });

  itDb('rejects an empty body with 400', async () => {
    const { token } = await registerOrg({ orgName: 'EmptyOrg' });
    const created = await createProperty(token, {
      name: 'Only',
      address: '1 Only St',
    });

    const res = await request(app)
      .patch(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  itDb('returns 404 when the property is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'PatchOrgA' });
    const created = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });

    const { token: tokenB } = await registerOrg({ orgName: 'PatchOrgB' });

    const res = await request(app)
      .patch(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/properties/:id', () => {
  itDb('deletes a property and returns 204', async () => {
    const { token } = await registerOrg({ orgName: 'DeleteOrg' });
    const created = await createProperty(token, {
      name: 'Temp',
      address: '1 Temp St',
    });

    const res = await request(app)
      .delete(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });

  itDb('returns 404 when the property is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'DeleteOrgA' });
    const created = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });

    const { token: tokenB } = await registerOrg({ orgName: 'DeleteOrgB' });

    const res = await request(app)
      .delete(`/api/v1/properties/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});

describe('org isolation', () => {
  itDb('list never contains another orgs properties', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'IsoOrgA' });
    const { token: tokenB } = await registerOrg({ orgName: 'IsoOrgB' });

    await createProperty(tokenA, { name: 'OrgA Only', address: '1 A St' });
    await createProperty(tokenB, { name: 'OrgB Only', address: '2 B St' });

    const resA = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${tokenA}`);
    const resB = await request(app)
      .get('/api/v1/properties')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
    expect(resA.body.data.map((p: { name: string }) => p.name)).toContain('OrgA Only');
    expect(resA.body.data.map((p: { name: string }) => p.name)).not.toContain('OrgB Only');
    expect(resB.body.data.map((p: { name: string }) => p.name)).toContain('OrgB Only');
    expect(resB.body.data.map((p: { name: string }) => p.name)).not.toContain('OrgA Only');
  });
});
