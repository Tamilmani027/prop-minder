import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { leaseService } from '../services'
import { unitService } from '../services'
import { tenantService } from '../services'
import { Button, Badge, Input, Card } from '../components/ui'
import { leaseSchema } from '../lib/validation'
import { Plus } from 'lucide-react'
import type { LeaseInput } from '../types'

export default function LeasesPage() {
  const queryClient = useQueryClient()
  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: () => leaseService.list(),
  })

  // Fetch units and tenants for the New Lease form dropdowns
  const { data: unitsData } = useQuery({
    queryKey: ['units-standalone'],
    queryFn: () => unitService.listStandalone({ limit: 100 }),
  })
  const { data: tenantsData } = useQuery({
    queryKey: ['tenants-for-lease'],
    queryFn: () => tenantService.list({ limit: 100 }),
  })

  const units = unitsData?.data || []
  const tenants = tenantsData?.data || []

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<LeaseInput>({
    unitId: '',
    tenantId: '',
    rentPaise: 0,
    depositPaise: 0,
    dueDay: 1,
    startDate: '',
    endDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  const createMutation = useMutation({
    mutationFn: leaseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] })
      setOpen(false)
      setFormData({
        unitId: '',
        tenantId: '',
        rentPaise: 0,
        depositPaise: 0,
        dueDay: 1,
        startDate: '',
        endDate: '',
      })
      setErrors({})
      setServerError('')
      setSuccess('Lease created successfully.')
      setTimeout(() => setSuccess(''), 4000)
    },
    onError: (err: any) => {
      setLoading(false)
      console.error('[LeasesPage] API error:', err)
      if (err.response?.data?.error?.details) {
        const details: Array<{ path: string | string[]; message: string }> = err.response.data.error.details
        const fieldErrors: Record<string, string> = {}
        for (const d of details) {
          const field = Array.isArray(d.path) ? d.path.join('.') : d.path
          fieldErrors[field] = d.message
        }
        setErrors(fieldErrors)
      } else {
        setServerError(err.response?.data?.error?.message || err.message || 'Failed to create lease')
      }
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & { type?: string }
    setFormData((prev) => {
      if (type === 'number') {
        return { ...prev, [name]: value === '' ? 0 : Number(value) }
      }
      return { ...prev, [name]: value }
    })
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError('')
    setSuccess('')
    setLoading(true)

    try {
      // Strip empty optional fields BEFORE validation so Zod doesn't reject them
      const cleaned: Record<string, unknown> = { ...formData }
      if (cleaned.endDate === '') delete cleaned.endDate

      const validated = leaseSchema.parse(cleaned)
      createMutation.mutate(validated as LeaseInput)
    } catch (err: any) {
      setLoading(false)
      console.error('[LeasesPage] Submit error:', err)
      if (err.response?.data?.error?.details) {
        const details: Array<{ path: string | string[]; message: string }> = err.response.data.error.details
        const fieldErrors: Record<string, string> = {}
        for (const d of details) {
          const field = Array.isArray(d.path) ? d.path.join('.') : d.path
          fieldErrors[field] = d.message
        }
        setErrors(fieldErrors)
      } else {
        setServerError(err.message || 'Validation failed')
      }
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f1a]">Leases</h1>
          <p className="text-[#5a6b5a] mt-1">Manage your leases</p>
        </div>
        <Button onClick={() => setOpen(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" /> New Lease
        </Button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-[#eef2ec] text-[#3d7a4f] rounded text-sm">
          {success}
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-3 bg-[#fdecec] text-[#b34545] rounded text-sm">
          {serverError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0e8de]">
              <th className="pb-3 text-sm font-medium text-[#647c64]">Unit</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Tenant</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Rent</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Status</th>
              <th className="pb-3 text-sm font-medium text-[#647c64] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leases?.data.map((lease: any) => (
              <tr key={lease.id} className="border-b border-[#e8f0e6] hover:bg-[#f4f7f4]">
                <td className="py-3 text-[#1a1f1a]">{lease.unitId}</td>
                <td className="py-3 text-[#1a1f1a]">{lease.tenantId}</td>
                <td className="py-3 text-[#5a6b5a]">{lease.rentPaise / 100}</td>
                <td className="py-3">
                  <Badge variant={lease.status === 'active' ? 'active' : 'ended'}>
                    {lease.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Button variant="outline" className="text-sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold text-[#1a1f1a] mb-4">New Lease</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Unit</label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                >
                  <option value="">Select a unit</option>
                  {units.map((unit: any) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unitId && <p className="text-xs text-[#b34545] mt-1">{errors.unitId}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Tenant</label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant: any) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {errors.tenantId && <p className="text-xs text-[#b34545] mt-1">{errors.tenantId}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Monthly Rent (₹)</label>
                <input
                  name="rentPaise"
                  type="number"
                  min="1"
                  value={formData.rentPaise === 0 ? '' : String(formData.rentPaise)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                  placeholder="0"
                />
                {errors.rentPaise && <p className="text-xs text-[#b34545] mt-1">{errors.rentPaise}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Deposit (₹)</label>
                <input
                  name="depositPaise"
                  type="number"
                  min="0"
                  value={String(formData.depositPaise)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                  placeholder="0"
                />
                {errors.depositPaise && <p className="text-xs text-[#b34545] mt-1">{errors.depositPaise}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Due Day (1-28)</label>
                <input
                  name="dueDay"
                  type="number"
                  min="1"
                  max="28"
                  value={String(formData.dueDay)}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                />
                {errors.dueDay && <p className="text-xs text-[#b34545] mt-1">{errors.dueDay}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                />
                {errors.startDate && <p className="text-xs text-[#b34545] mt-1">{errors.startDate}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">End Date (optional)</label>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                />
                {errors.endDate && <p className="text-xs text-[#b34545] mt-1">{errors.endDate}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isPending || loading}
                >
                  {loading || createMutation.isPending ? 'Creating...' : 'Create Lease'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
