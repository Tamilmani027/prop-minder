// Set test environment variables before env.ts parses them. Values are
// placeholders only; no secrets are logged or committed.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/propminder_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
// 32+ char test-only secret. Never use a real secret in tests.
process.env.JWT_SECRET = 'test-test-test-test-test-test-test-test';
process.env.JWT_EXPIRES_IN_SECONDS = '3600';
