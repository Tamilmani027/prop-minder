import { useQuery } from '@tanstack/react-query'
import { Button, Badge } from '../components/ui'
import { leaseService } from '../services'

export default function LeasesPage() {
  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: () => leaseService.list(),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leases</h1>
          <p className="text-gray-500 mt-1">Manage your leases</p>
        </div>
        <Button variant="primary">
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Lease
          </span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-medium text-gray-600">Unit</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Tenant</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Rent</th>
              <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
              <th className="pb-3 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leases?.data.map((lease: any) => (
              <tr key={lease.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-gray-900">{lease.unitId}</td>
                <td className="py-3 text-gray-900">{lease.tenantId}</td>
                <td className="py-3 text-gray-600">{lease.rentPaise / 100}</td>
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
    </div>
  )
}
