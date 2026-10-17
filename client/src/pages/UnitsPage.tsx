import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { unitService } from '../services'
import { Card, Input, Button } from '../components/ui'
import { unitSchema } from '../lib/validation'
import { Plus, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function UnitsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: units, isLoading } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: () => unitService.list(propertyId!),
    enabled: !!propertyId,
  })

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ label: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: (data: any) => unitService.create(propertyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', propertyId] })
      setOpen(false)
      setFormData({ label: '', notes: '' })
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: { label: string; notes: string }) => ({ ...prev, [name]: value }))
    setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const validated = unitSchema.parse(formData)
      createMutation.mutate(validated)
    } catch (err: any) {
      if (err.response?.data?.error?.details) {
        setErrors(err.response.data.error.details)
      }
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units</h1>
          <p className="text-gray-500 mt-1">Manage property units</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setOpen(true)} variant="primary">
            <Plus className="h-4 w-4 mr-2" /> Add Unit
          </Button>
          <Button variant="outline" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-medium text-gray-600">Label</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Notes</th>
              <th className="pb-3 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units?.data.map((unit: any) => (
              <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-gray-900 font-medium">{unit.label}</td>
                <td className="py-3 text-gray-600">{unit.notes || '-'}</td>
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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Unit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                error={errors.label}
              />
              <Input
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
