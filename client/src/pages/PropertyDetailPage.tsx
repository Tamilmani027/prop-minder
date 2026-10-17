import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { propertyService, unitService } from '../services'
import { Card, Button } from '../components/ui'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.get(id!),
  })
  const { data: units } = useQuery({
    queryKey: ['units', id],
    queryFn: () => unitService.list(id!),
    enabled: !!id,
  })

  if (!property) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <p className="text-gray-500 mt-1">{property.address}, {property.city}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/properties/${id}/units/new`)}
            variant="primary"
          >
            Add Unit
          </Button>
          <Button variant="outline" onClick={() => navigate('/properties')}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p className="mt-1 text-gray-900">
            {property.address}, {property.city || ''}
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {units?.data.length || 0}
            </span>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Units</h2>
      {units?.data.length === 0 ? (
        <p className="text-gray-500">No units yet. Add your first unit.</p>
      ) : (
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
                    <Button variant="outline" className="text-sm">Manage</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
