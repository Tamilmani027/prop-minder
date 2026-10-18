export interface User {
  id: string
  name: string
  email: string
  role: string
  orgId: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export interface Property {
  id: string
  orgId: string
  name: string
  address: string
  city?: string
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  orgId: string
  propertyId: string
  label: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  orgId: string
  name: string
  phone: string
  email?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type LeaseStatus = 'active' | 'ended'

export interface Lease {
  id: string
  orgId: string
  unitId: string
  tenantId: string
  rentPaise: number
  depositPaise: number
  dueDay: number
  startDate: string
  endDate?: string
  status: LeaseStatus
  createdAt: string
  updatedAt: string
}

export interface RentCharge {
  id: string
  orgId: string
  leaseId: string
  unitId: string
  tenantId: string
  tenantName: string
  unitLabel: string
  period: string
  amountPaise: number
  dueDate: string
  paidPaise: number
  status: 'paid' | 'partial' | 'overdue' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface DashboardData {
  period: string
  totalDuePaise: number
  collectedPaise: number
  pendingPaise: number
  overduePaise: number
  counts: {
    charges: number
    paid: number
    partial: number
    overdue: number
    pending: number
  }
  occupancy: {
    unitsTotal: number
    unitsOccupied: number
  }
  overdueList: Array<{
    id: string
    tenantName: string
    unitLabel: string
    dueDate: string
    balancePaise: number
  }>
}

export interface RegisterInput {
  orgName: string
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface PropertyInput {
  name: string
  address: string
  city?: string
}

export interface UnitInput {
  label: string
  notes?: string
}

export interface TenantInput {
  name: string
  phone: string
  email?: string
  notes?: string
}

export interface LeaseInput {
  unitId: string
  tenantId: string
  rentPaise: number
  depositPaise: number
  dueDay: number
  startDate: string
  endDate?: string
}
