import { api } from '../lib/api'
import type { Tenant, TenantInput, PaginatedResponse } from '../types'

export const tenantService = {
  list: async (params?: {
    q?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Tenant>> => {
    const res = await api.get('/tenants', { params })
    return res.data
  },
  get: async (id: string): Promise<Tenant> => {
    const res = await api.get(`/tenants/${id}`)
    return res.data
  },
  create: async (data: TenantInput): Promise<Tenant> => {
    const res = await api.post('/tenants', data)
    return res.data
  },
  update: async (id: string, data: Partial<TenantInput>): Promise<Tenant> => {
    const res = await api.patch(`/tenants/${id}`, data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`)
  },
}
