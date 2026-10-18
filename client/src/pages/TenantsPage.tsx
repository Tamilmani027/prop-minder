import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui'
import { tenantService } from '../services'

export default function TenantsPage() {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantService.list(),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f1a]">Tenants</h1>
          <p className="text-[#5a6b5a] mt-1">Manage your tenants</p>
        </div>
        <Button variant="primary">
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Tenant
          </span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0e8de]">
              <th className="pb-3 text-sm font-medium text-[#647c64]">Name</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Phone</th>
              <th className="pb-3 text-sm font-medium text-[#647c64]">Email</th>
              <th className="pb-3 text-sm font-medium text-[#647c64] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.data.map((tenant: any) => (
              <tr key={tenant.id} className="border-b border-[#e8f0e6] hover:bg-[#f4f7f4]">
                <td className="py-3 text-[#1a1f1a] font-medium">{tenant.name}</td>
                <td className="py-3 text-[#5a6b5a]">{tenant.phone}</td>
                <td className="py-3 text-[#5a6b5a]">{tenant.email || '-'}</td>
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
