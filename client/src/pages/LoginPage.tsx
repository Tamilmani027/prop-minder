import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Button } from '../components/ui'
import { authService } from '../services'
import { loginSchema } from '../lib/validation'
import { useAuthActions } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthActions()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  // Redirect after login succeeds (avoids calling navigate during render)
  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo)
    }
  }, [redirectTo, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[LoginPage] submit clicked')
    setErrors({})
    setServerError('')

    try {
      const validated = loginSchema.parse(formData)
      console.log('[LoginPage] validated', validated)
      setLoading(true)
      const response = await authService.login(validated)
      console.log('[LoginPage] response', response)
      login(response.data.token, response.data.user)
      setRedirectTo('/dashboard')
    } catch (err: any) {
      console.error('[LoginPage] error', err)
      if (err.response?.data?.error?.details) {
        setErrors(err.response.data.error.details)
      } else {
        setServerError(err.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Create account
          </button>
        </p>
      </Card>
    </div>
  )
}
