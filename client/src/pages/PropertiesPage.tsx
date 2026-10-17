import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyService } from '../services'
import { Card, Button, Input } from '../components/ui'
import { propertySchema } from '../lib/validation'
import { Plus } from 'lucide-react'
import type { Property } from '../types'
import { useState } from 'react'

export default function PropertiesPage() {
  const queryClient = useQueryClient()
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.list({}),
  })

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '', city: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setOpen(false)
      setFormData({ name: '', address: '', city: '' })
      setErrors({})
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: { name: string; address: string; city: string }) => ({ ...prev, [name]: value }))
    setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const validated = propertySchema.parse(formData)
      createMutation.mutate(validated)
    } catch (err: any) {
      if (err.response?.data?.error?.details) {
        setErrors(err.response.data.error.details)
      }
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your properties</p>
        </div>
        <Button onClick={() => setOpen(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" /> Add Property
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-medium text-gray-600">Name</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Address</th>
              <th className="pb-3 text-sm font-medium text-gray-600">City</th>
              <th className="pb-3 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties?.data.map((prop: Property) => (
              <tr key={prop.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-gray-900 font-medium">{prop.name}</td>
                <td className="py-3 text-gray-600">{prop.address}</td>
                <td className="py-3 text-gray-600">{prop.city || '-'}</td>
                <td className="py-3 text-right">
                  <Button variant="outline" className="text-sm">
                    Units
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Property</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
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
