import { api } from '../lib/api'
import type { Property, PropertyInput, PaginatedResponse } from '../types'

export const propertyService = {
  list: async (params?: {
    q?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Property>> => {
    const res = await api.get('/properties', { params })
    return res.data
  },
  get: async (id: string): Promise<Property> => {
    const res = await api.get(`/properties/${id}`)
    return res.data
  },
  create: async (data: PropertyInput): Promise<Property> => {
    const res = await api.post('/properties', data)
    return res.data
  },
  update: async (id: string, data: Partial<PropertyInput>): Promise<Property> => {
    const res = await api.patch(`/properties/${id}`, data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`)
  },
}
