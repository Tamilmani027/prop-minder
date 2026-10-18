import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Button } from '../components/ui'
import { authService } from '../services'
import { registerSchema } from '../lib/validation'
import { useAuthActions } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthActions()
  const [formData, setFormData] = useState({
    orgName: '',
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  // Redirect after registration succeeds (avoids calling navigate during render)
  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo, { replace: true })
    }
  }, [redirectTo, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[RegisterPage] submit clicked')
    setErrors({})
    setServerError('')

    try {
      const validated = registerSchema.parse(formData)
      console.log('[RegisterPage] validated', validated)
      setLoading(true)
      const response = await authService.register(validated)
      console.log('[RegisterPage] response', response)
      login(response.data.token, response.data.user)
      setRedirectTo('/dashboard')
    } catch (err: any) {
      console.error('[RegisterPage] error', err)
      if (err.response?.data?.error?.details) {
        setErrors(err.response.data.error.details)
      } else {
        setServerError(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f4]">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a1f1a]">Create account</h1>
          <p className="text-[#5a6b5a] mt-2">Set up your organization</p>
        </div>
        {serverError && (
          <div className="mb-4 p-3 bg-[#fdecec] text-[#b34545] rounded text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            name="orgName"
            value={formData.orgName}
            onChange={handleChange}
            error={errors.orgName}
          />
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
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
          <Button type="submit" variant="" className="w-full bg-[#3d7a4f] text-white" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[#5a6b5a]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#3d7a4f] font-medium"
          >
            Sign in
          </button>
        </p>
      </Card>
    </div>
  )
}
