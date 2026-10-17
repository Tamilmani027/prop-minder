import type { Tenant } from '../types'
import type { TenantInput } from '../lib/validation'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export const tenantService = {
  list: async (params?: {
    q?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Tenant>> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/tenants', { params }))
    return res.data
  },
  get: async (id: string): Promise<Tenant> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/tenants/${id}`))
    return res.data
  },
  create: async (data: TenantInput): Promise<Tenant> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/tenants', data))
    return res.data
  },
  update: async (id: string, data: Partial<TenantInput>): Promise<Tenant> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.patch(`/tenants/${id}`, data))
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await import('../lib/api').then((m) => m.api.delete(`/tenants/${id}`))
  },
}
