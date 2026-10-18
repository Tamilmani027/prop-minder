import { api } from '../lib/api'
import type { Unit, UnitInput, PaginatedResponse } from '../types'

export const unitService = {
  list: async (propertyId: string, params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Unit>> => {
    const res = await api.get(`/properties/${propertyId}/units`, { params })
    return res.data
  },
  listStandalone: async (params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Unit>> => {
    const res = await api.get('/units', { params })
    return res.data
  },
  get: async (id: string): Promise<Unit> => {
    const res = await api.get(`/units/${id}`)
    return res.data
  },
  create: async (propertyId: string, data: UnitInput): Promise<Unit> => {
    const res = await api.post(`/properties/${propertyId}/units`, data)
    return res.data
  },
  update: async (id: string, data: Partial<UnitInput>): Promise<Unit> => {
    const res = await api.patch(`/units/${id}`, data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`)
  },
}
