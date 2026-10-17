import type { Lease } from '../types'
import type { LeaseInput } from '../lib/validation'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export const leaseService = {
  list: async (params?: {
    status?: string
    unitId?: string
    tenantId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Lease>> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/leases', { params }))
    return res.data
  },
  get: async (id: string): Promise<Lease> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/leases/${id}`))
    return res.data
  },
  create: async (data: LeaseInput): Promise<Lease> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/leases', data))
    return res.data
  },
  update: async (id: string, data: Partial<LeaseInput>): Promise<Lease> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.patch(`/leases/${id}`, data))
    return res.data
  },
  end: async (id: string): Promise<Lease> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post(`/leases/${id}/end`))
    return res.data
  },
}
