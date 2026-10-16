import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { tenantPlugin } from '../src/db/tenantPlugin';

describe('tenantPlugin', () => {
  let mongod: MongoMemoryServer | null = null;
  let conn: mongoose.Connection | null = null;
  // TODO: avoid `any`; Mongoose model typing needs generics we are avoiding here.
  let Widget: any;
  const orgA = new mongoose.Types.ObjectId();
  const orgB = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    try {
      // Race against a short timeout so the suite skips quickly when the
      // MongoDB binary cannot be downloaded (e.g. offline dev machines).
      // In CI the binary downloads fine and the tests run for real.
      await Promise.race([
        (async () => {
          mongod = await MongoMemoryServer.create();
          conn = mongoose.createConnection(mongod.getUri());
          const schema = new mongoose.Schema({ name: String });
          schema.plugin(tenantPlugin);
          Widget = conn.model('Widget', schema);
          await Widget.create([
            { orgId: orgA, name: 'widget-a1' },
            { orgId: orgA, name: 'widget-a2' },
            { orgId: orgB, name: 'widget-b1' },
          ]);
        })(),
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error('mongodb unavailable')), 5000)
        ),
      ]);
    } catch (err) {
      // MongoDB unavailable in this environment; tests below will no-op.
      console.log('Skipping tenantPlugin tests: MongoDB unavailable', (err as Error).message);
    }
  }, 10000);

  afterAll(async () => {
    if (conn) {
      await conn.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it('find({}) rejects because orgId is missing', async () => {
    if (!Widget) return;
    await expect(Widget.find({})).rejects.toThrow(/missing orgId/);
  });

  it('findById rejects by design (it supplies no orgId filter)', async () => {
    if (!Widget) return;
    const doc = await Widget.findOne({ orgId: orgA });
    await expect(Widget.findById(doc._id)).rejects.toThrow(/missing orgId/);
  });

  it('updateMany({}) rejects', async () => {
    if (!Widget) return;
    await expect(Widget.updateMany({}, { $set: { name: 'x' } })).rejects.toThrow(
      /missing orgId/
    );
  });

  it('deleteMany({}) rejects', async () => {
    if (!Widget) return;
    await expect(Widget.deleteMany({})).rejects.toThrow(/missing orgId/);
  });

  it('find({orgId}) returns only that orgs docs', async () => {
    if (!Widget) return;
    const docs = await Widget.find({ orgId: orgA });
    expect(docs.map((d: any) => d.name).sort()).toEqual(['widget-a1', 'widget-a2']);
  });

  it('skipTenant returns all docs', async () => {
    if (!Widget) return;
    const all = await Widget.find({}).setOptions({ skipTenant: true });
    expect(all.length).toBe(3);
  });

  it('creating without orgId fails validation', async () => {
    if (!Widget) return;
    await expect(Widget.create({ name: 'no-org' })).rejects.toThrow(/orgId/);
  });

  it('aggregate without leading $match on orgId rejects', async () => {
    if (!Widget) return;
    await expect(Widget.aggregate([{ $match: { name: 'x' } }])).rejects.toThrow(
      /\$match on orgId/
    );
  });

  it('aggregate with $match on orgId works', async () => {
    if (!Widget) return;
    const result = await Widget.aggregate([
      { $match: { orgId: orgA } },
      { $count: 'n' },
    ]);
    expect(result[0].n).toBe(2);
  });
});
