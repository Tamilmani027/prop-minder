import { api } from '../lib/api'
import type { RentCharge, DashboardData } from '../types'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export const rentService = {
  generate: async (period: string): Promise<{
    period: string
    created: number
    skipped: number
  }> => {
    const res = await api.post('/rent/generate', { period })
    return res.data
  },
  list: async (params?: {
    period?: string
    status?: string
    leaseId?: string
    tenantId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<RentCharge>> => {
    const res = await api.get('/rent/charges', { params })
    return res.data
  },
  get: async (id: string): Promise<RentCharge> => {
    const res = await api.get(`/rent/charges/${id}`)
    return res.data
  },
}

export const dashboardService = {
  get: async (period?: string): Promise<DashboardData> => {
    const res = await api.get('/dashboard', {
      params: period ? { period } : undefined,
    })
    return res.data
  },
}
