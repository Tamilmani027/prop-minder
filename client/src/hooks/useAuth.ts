import { useAuth } from '../context/AuthContext'

export function useAuthActions() {
  const { login, logout, user, token, isLoading } = useAuth()
  return { login, logout, user, token, isLoading }
}
