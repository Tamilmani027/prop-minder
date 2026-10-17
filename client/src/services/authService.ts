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
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/auth/register', data))
    return res
  },
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.post('/auth/login', data))
    return res
  },
  getCurrentUser: async (): Promise<User> => {
    const { data: res } = await import('../lib/api').then((m) => m.api.get('/auth/me'))
    return res.data
  },
}
