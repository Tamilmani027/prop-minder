import type { Unit } from '../types'
import type { UnitInput } from '../lib/validation'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export const unitService = {
  list: async (propertyId: string, params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Unit>> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/properties/${propertyId}/units`, { params }))
    return res.data
  },
  listStandalone: async (params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Unit>> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/units', { params }))
    return res.data
  },
  get: async (id: string): Promise<Unit> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/units/${id}`))
    return res.data
  },
  create: async (propertyId: string, data: UnitInput): Promise<Unit> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post(`/properties/${propertyId}/units`, data))
    return res.data
  },
  update: async (id: string, data: Partial<UnitInput>): Promise<Unit> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.patch(`/units/${id}`, data))
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await import('../lib/api').then((m) => m.api.delete(`/units/${id}`))
  },
}
