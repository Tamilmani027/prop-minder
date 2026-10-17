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
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/rent/generate', { period }))
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
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/rent/charges', { params }))
    return res.data
  },
  get: async (id: string): Promise<RentCharge> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get(`/rent/charges/${id}`))
    return res.data
  },
}

export const dashboardService = {
  get: async (period?: string): Promise<DashboardData> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/dashboard', { params: period ? { period } : undefined }))
    return res.data
  },
}
