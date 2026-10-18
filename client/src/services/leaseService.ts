import { api } from '../lib/api'
import type { Lease, LeaseInput, PaginatedResponse } from '../types'

export const leaseService = {
  list: async (params?: {
    status?: string
    unitId?: string
    tenantId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Lease>> => {
    const res = await api.get('/leases', { params })
    return res.data
  },
  get: async (id: string): Promise<Lease> => {
    const res = await api.get(`/leases/${id}`)
    return res.data
  },
  create: async (data: LeaseInput): Promise<Lease> => {
    const res = await api.post('/leases', data)
    return res.data
  },
  update: async (id: string, data: Partial<LeaseInput>): Promise<Lease> => {
    const res = await api.patch(`/leases/${id}`, data)
    return res.data
  },
  end: async (id: string): Promise<Lease> => {
    const res = await api.post(`/leases/${id}/end`)
    return res.data
  },
}
