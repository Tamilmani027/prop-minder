import { api } from '../lib/api'
import type { User, AuthResponse } from '../types'

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

export const authService = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    console.log('[authService.register]', data.email)
    const res = await api.post<AuthResponse>('/auth/register', data)
    console.log('[authService.register] success', res.data)
    return res.data
  },
  login: async (data: LoginInput): Promise<AuthResponse> => {
    console.log('[authService.login]', data.email)
    const res = await api.post<AuthResponse>('/auth/login', data)
    console.log('[authService.login] success', res.data)
    return res.data
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<{ data: User }>('/auth/me')
    return res.data.data
  },
}
