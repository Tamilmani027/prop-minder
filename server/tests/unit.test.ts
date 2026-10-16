import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import request from 'supertest';

let mongod: MongoMemoryServer | null = null;
const app = createApp();

// Registers an organization + owner user via the auth endpoint and returns the
// JWT token plus the org/user ids. Every unit route is authenticated, so tests
// use this token to scope requests to an organization.
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

// Create a property under the caller's org, return the created property doc.
const createProperty = async (token: string, body: Record<string, unknown>) => {
  const res = await request(app)
    .post('/api/v1/properties')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  expect(res.status).toBe(201);
  return res.body.data;
};

// Create a unit nested under a property, return the created unit doc.
const createUnit = async (
  token: string,
  propertyId: string,
  body: Record<string, unknown>
) => {
  const res = await request(app)
    .post(`/api/v1/properties/${propertyId}/units`)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
  return res;
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
    console.log('Skipping unit tests: MongoDB unavailable', (err as Error).message);
  }
}, 15000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('POST /api/v1/properties/:propertyId/units', () => {
  itDb('creates a unit and returns 201 { data }', async () => {
    const { token } = await registerOrg({ orgName: 'UnitOrg' });
    const property = await createProperty(token, {
      name: 'Main Office',
      address: '123 Main St',
    });

    const res = await createUnit(token, property.id, {
      label: '101',
      notes: 'Corner office',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      label: '101',
      notes: 'Corner office',
      propertyId: property.id,
    });
    expect(res.body.data.id).toBeDefined();
  });

  itDb('returns 404 when the property is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'PropOrgA' });
    const property = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });

    const { token: tokenB } = await registerOrg({ orgName: 'PropOrgB' });

    const res = await createUnit(tokenB, property.id, { label: '101' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  itDb('returns 400 for an invalid propertyId', async () => {
    const { token } = await registerOrg({ orgName: 'BadPropOrg' });

    const res = await createUnit(token, 'not-an-id', { label: '101' });

    expect(res.status).toBe(400);
  });

  itDb('returns 409 for a duplicate unit label in the same property', async () => {
    const { token } = await registerOrg({ orgName: 'DupOrg' });
    const property = await createProperty(token, {
      name: 'Dup Property',
      address: '1 Dup St',
    });

    await createUnit(token, property.id, { label: '101' });
    const res = await createUnit(token, property.id, { label: '101' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('GET /api/v1/properties/:propertyId/units', () => {
  itDb('lists units sorted by label with pagination', async () => {
    const { token } = await registerOrg({ orgName: 'ListUnitOrg' });
    const property = await createProperty(token, {
      name: 'List Property',
      address: '1 List St',
    });

    await createUnit(token, property.id, { label: 'B Unit' });
    await createUnit(token, property.id, { label: 'A Unit' });
    await createUnit(token, property.id, { label: 'C Unit' });

    const res = await request(app)
      .get(`/api/v1/properties/${property.id}/units`)
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].label).toBe('A Unit');
    expect(res.body.data[1].label).toBe('B Unit');
    expect(res.body.total).toBe(3);
  });

  itDb('returns 404 when the property is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'ListPropOrgA' });
    const property = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });

    const { token: tokenB } = await registerOrg({ orgName: 'ListPropOrgB' });

    const res = await request(app)
      .get(`/api/v1/properties/${property.id}/units`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/units/:id', () => {
  itDb('returns a single unit', async () => {
    const { token } = await registerOrg({ orgName: 'GetUnitOrg' });
    const property = await createProperty(token, {
      name: 'Get Property',
      address: '1 Get St',
    });
    const created = await createUnit(token, property.id, { label: '101' });

    const res = await request(app)
      .get(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.label).toBe('101');
    expect(res.body.data.propertyId).toBe(property.id);
  });

  itDb('returns 404 when the unit is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'GetPropOrgA' });
    const property = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });
    const created = await createUnit(tokenA, property.id, { label: '101' });

    const { token: tokenB } = await registerOrg({ orgName: 'GetPropOrgB' });

    const res = await request(app)
      .get(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  itDb('returns 400 for an invalid :id', async () => {
    const { token } = await registerOrg({ orgName: 'BadUnitIdOrg' });

    const res = await request(app)
      .get('/api/v1/units/not-an-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/v1/units/:id', () => {
  itDb('updates a unit', async () => {
    const { token } = await registerOrg({ orgName: 'PatchUnitOrg' });
    const property = await createProperty(token, {
      name: 'Patch Property',
      address: '1 Patch St',
    });
    const created = await createUnit(token, property.id, {
      label: '101',
      notes: 'Old notes',
    });

    const res = await request(app)
      .patch(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ label: '102', notes: 'New notes' });

    expect(res.status).toBe(200);
    expect(res.body.data.label).toBe('102');
    expect(res.body.data.notes).toBe('New notes');
  });

  itDb('rejects an empty body with 400', async () => {
    const { token } = await registerOrg({ orgName: 'EmptyUnitOrg' });
    const property = await createProperty(token, {
      name: 'Empty Property',
      address: '1 Empty St',
    });
    const created = await createUnit(token, property.id, { label: '101' });

    const res = await request(app)
      .patch(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  itDb('returns 409 for a duplicate label after update', async () => {
    const { token } = await registerOrg({ orgName: 'PatchDupOrg' });
    const property = await createProperty(token, {
      name: 'PatchDup Property',
      address: '1 PatchDup St',
    });
    await createUnit(token, property.id, { label: '101' });
    const created = await createUnit(token, property.id, { label: '102' });

    const res = await request(app)
      .patch(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ label: '101' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  itDb('returns 404 when the unit is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'PatchPropOrgA' });
    const property = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });
    const created = await createUnit(tokenA, property.id, { label: '101' });

    const { token: tokenB } = await registerOrg({ orgName: 'PatchPropOrgB' });

    const res = await request(app)
      .patch(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ label: 'Hacked' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/units/:id', () => {
  itDb('deletes a unit and returns 204', async () => {
    const { token } = await registerOrg({ orgName: 'DeleteUnitOrg' });
    const property = await createProperty(token, {
      name: 'Delete Property',
      address: '1 Delete St',
    });
    const created = await createUnit(token, property.id, { label: '101' });

    const res = await request(app)
      .delete(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });

  itDb('returns 404 when the unit is not in the callers org', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'DeletePropOrgA' });
    const property = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });
    const created = await createUnit(tokenA, property.id, { label: '101' });

    const { token: tokenB } = await registerOrg({ orgName: 'DeletePropOrgB' });

    const res = await request(app)
      .delete(`/api/v1/units/${created.body.data.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});

describe('property-delete guard', () => {
  itDb('returns 409 when the property still has units', async () => {
    const { token } = await registerOrg({ orgName: 'GuardOrg' });
    const property = await createProperty(token, {
      name: 'Guard Property',
      address: '1 Guard St',
    });
    await createUnit(token, property.id, { label: '101' });

    const res = await request(app)
      .delete(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  itDb('allows deletion when the property has no units', async () => {
    const { token } = await registerOrg({ orgName: 'GuardEmptyOrg' });
    const property = await createProperty(token, {
      name: 'Guard Empty Property',
      address: '1 Guard Empty St',
    });

    const res = await request(app)
      .delete(`/api/v1/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});

describe('org isolation', () => {
  itDb('list never contains another orgs units', async () => {
    const { token: tokenA } = await registerOrg({ orgName: 'IsoOrgA' });
    const { token: tokenB } = await registerOrg({ orgName: 'IsoOrgB' });

    const propertyA = await createProperty(tokenA, {
      name: 'OrgA Property',
      address: '1 A St',
    });
    const propertyB = await createProperty(tokenB, {
      name: 'OrgB Property',
      address: '2 B St',
    });

    await createUnit(tokenA, propertyA.id, { label: 'A-101' });
    await createUnit(tokenB, propertyB.id, { label: 'B-101' });

    const resA = await request(app)
      .get(`/api/v1/properties/${propertyA.id}/units`)
      .set('Authorization', `Bearer ${tokenA}`);
    const resB = await request(app)
      .get(`/api/v1/properties/${propertyB.id}/units`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
    expect(resA.body.data.map((u: { label: string }) => u.label)).toContain('A-101');
    expect(resA.body.data.map((u: { label: string }) => u.label)).not.toContain('B-101');
    expect(resB.body.data.map((u: { label: string }) => u.label)).toContain('B-101');
    expect(resB.body.data.map((u: { label: string }) => u.label)).not.toContain('A-101');
  });
});
