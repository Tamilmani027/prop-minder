import type { Property } from '../types'
import type { PropertyInput } from '../lib/validation'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export const propertyService = {
  list: async (params?: {
    q?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Property>> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/properties', { params }))
    return res.data
  },
  get: async (id: string): Promise<Property> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/properties/${id}`))
    return res.data
  },
  create: async (data: PropertyInput): Promise<Property> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/properties', data))
    return res.data
  },
  update: async (id: string, data: Partial<PropertyInput>): Promise<Property> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.patch(`/properties/${id}`, data))
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await import('../lib/api').then((m) => m.api.delete(`/properties/${id}`))
  },
}
