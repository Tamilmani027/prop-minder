import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { tenantService } from '../services'
import { propertyService } from '../services'
import { unitService } from '../services'
import { Card, Input, Button } from '../components/ui'
import { tenantSchema } from '../lib/validation'
import { Plus } from 'lucide-react'
import type { TenantInput, Property, Unit } from '../types'

export default function TenantsPage() {
  const queryClient = useQueryClient()
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantService.list(),
  })

  // Fetch properties for the Property/Unit dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.list({ limit: 100 }),
  })
  const properties: Property[] = propertiesData?.data || []

  // Units for the currently selected property (dependent dropdown)
  const [units, setUnits] = useState<Unit[]>([])

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TenantInput>({
    name: '',
    phone: '',
    email: '',
    notes: '',
    propertyId: '',
    unitId: '',
    monthlyRent: undefined,
    dueDate: '',
  })

  // Fetch units whenever the selected property changes (dependent dropdown).
  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.propertyId) {
        setUnits([])
        setFormData((prev) => ({ ...prev, unitId: '' }))
        return
      }
      try {
        const res = await unitService.list(formData.propertyId, { limit: 100 })
        setUnits(res.data || [])
        // Reset unit selection when the property changes
        setFormData((prev) => ({ ...prev, unitId: '' }))
      } catch (err) {
        console.error('[TenantsPage] Failed to load units:', err)
        setUnits([])
        setFormData((prev) => ({ ...prev, unitId: '' }))
      }
    }
    fetchUnits()
  }, [formData.propertyId])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  const createMutation = useMutation({
    mutationFn: tenantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setOpen(false)
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: '',
        propertyId: '',
        unitId: '',
        monthlyRent: undefined,
        dueDate: '',
      })
      setErrors({})
      setServerError('')
      setSuccess('Tenant created successfully.')
      setTimeout(() => setSuccess(''), 4000)
    },
    onError: (err: any) => {
      setLoading(false)
      console.error('[TenantsPage] API error:', err)
      if (err.response?.data?.error?.details) {
        const details: Array<{ path: string | string[]; message: string }> = err.response.data.error.details
        const fieldErrors: Record<string, string> = {}
        for (const d of details) {
          const field = Array.isArray(d.path) ? d.path.join('.') : d.path
          fieldErrors[field] = d.message
        }
        setErrors(fieldErrors)
      } else {
        const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to create tenant'
        setServerError(msg)
        console.error('[TenantsPage] Server response:', err.response?.data)
      }
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & { type?: string }
    setFormData((prev) => {
      if (type === 'number') {
        return { ...prev, [name]: value === '' ? undefined : Number(value) }
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
      // Strip empty optional fields BEFORE validation so Zod doesn't reject them.
      // dueDate is required in the schema — it must not be stripped.
      const cleaned: Record<string, unknown> = { ...formData }
      if (cleaned.propertyId === '') delete cleaned.propertyId
      if (cleaned.unitId === '') delete cleaned.unitId
      if (cleaned.monthlyRent === '' || cleaned.monthlyRent === undefined) delete cleaned.monthlyRent
      if (cleaned.email === '') delete cleaned.email
      if (cleaned.notes === '') delete cleaned.notes

      const validated = tenantSchema.parse(cleaned)
      createMutation.mutate(validated as TenantInput)
    } catch (err: any) {
      setLoading(false)
      console.error('[TenantsPage] Submit error:', err)
      if (err.response?.data?.error?.details) {
        const details: Array<{ path: string | string[]; message: string }> = err.response.data.error.details
        const fieldErrors: Record<string, string> = {}
        for (const d of details) {
          const field = Array.isArray(d.path) ? d.path.join('.') : d.path
          fieldErrors[field] = d.message
        }
        setErrors(fieldErrors)
      } else {
        const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Validation failed'
        setServerError(msg)
        console.error('[TenantsPage] Server response:', err.response?.data)
      }
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f1a]">Tenants</h1>
          <p className="text-[#5a6b5a] mt-1">Manage your tenants</p>
        </div>
        <Button onClick={() => setOpen(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" /> Add Tenant
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
              <th className="pb-3 text-sm font-medium text-[#647c64]">Name</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Contact</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Property</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Monthly Rent</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Due Date</th>
              <th className="pb-3 text-sm font-medium text-[#647c64] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.data.map((tenant: any) => (
              <tr key={tenant.id} className="border-b border-[#e8f0e6] hover:bg-[#f4f7f4]">
                <td className="py-3 text-[#1a1f1a] font-medium">{tenant.name}</td>
                <td className="py-3 text-[#5a6b5a]">{tenant.phone}</td>
                <td className="py-3 text-[#5a6b5a]">
                  {tenant.propertyId ? (
                    <span className="text-[#1a1f1a] font-medium">
                      {properties.find((p) => p.id === tenant.propertyId)?.name || tenant.propertyId}
                    </span>
                  ) : (
                    <span className="text-[#8da58d]">-</span>
                  )}
                </td>
                <td className="py-3 text-[#5a6b5a]">
                  {tenant.monthlyRent !== undefined ? `₹${tenant.monthlyRent}` : '-'}
                </td>
                <td className="py-3 text-[#5a6b5a]">{tenant.dueDate || '-'}</td>
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
          <Card className="w-11/12 sm:max-w-md">
            <h2 className="text-lg font-bold text-[#1a1f1a] mb-4">Add Tenant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tenant Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              <Input
                label="Contact Info (Phone)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">
                  Property / Unit
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                >
                  <option value="">Select a property</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
                {errors.propertyId && <p className="text-xs text-[#b34545] mt-1">{errors.propertyId}</p>}
              </div>

              {formData.propertyId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#5a6b5a] mb-1">
                    Unit
                  </label>
                  <select
                    name="unitId"
                    value={formData.unitId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                    disabled={units.length === 0}
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  {units.length === 0 && formData.propertyId && (
                    <p className="text-xs text-[#8da58d] mt-1">No units found for this property</p>
                  )}
                  {errors.unitId && <p className="text-xs text-[#b34545] mt-1">{errors.unitId}</p>}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">
                  Monthly Rent
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#5a6b5a]">₹</span>
                  <input
                    name="monthlyRent"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.monthlyRent === undefined ? '' : String(formData.monthlyRent)}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                    placeholder="0"
                  />
                </div>
                {errors.monthlyRent && <p className="text-xs text-[#b34545] mt-1">{errors.monthlyRent}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5a6b5a] mb-1">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3d7a4f] border-[#c9d6c9] bg-white"
                  error={errors.dueDate}
                />
                {errors.dueDate && <p className="text-xs text-[#b34545] mt-1">{errors.dueDate}</p>}
              </div>
              <Input
                label="Notes (optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isPending || loading}
                >
                  {loading || createMutation.isPending ? 'Creating...' : 'Create Tenant'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
