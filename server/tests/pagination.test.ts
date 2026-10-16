import { paginationSchema } from '../src/utils/zod';

describe('paginationSchema', () => {
  it('applies defaults: page 1, limit 20', () => {
    const parsed = paginationSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it('parses coerced numeric strings from query params', () => {
    const parsed = paginationSchema.parse({ page: '3', limit: '10' });
    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(10);
  });

  it('rejects a limit above 100', () => {
    expect(() => paginationSchema.parse({ limit: '200' })).toThrow();
  });

  it('rejects non-positive page', () => {
    expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    expect(() => paginationSchema.parse({ page: -1 })).toThrow();
  });

  it('rejects non-positive limit', () => {
    expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
    expect(() => paginationSchema.parse({ limit: -5 })).toThrow();
  });
});
