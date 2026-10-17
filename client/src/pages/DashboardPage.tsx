import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services'
import { Card, Badge } from '../components/ui'

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="flex items-baseline mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400 ml-1">{subtitle}</span>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get(),
  })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Organization: {user?.orgId}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Generate Charges
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Due" value={data.totalDuePaise / 100} subtitle="paise" />
        <StatCard title="Collected" value={data.collectedPaise / 100} subtitle="paise" />
        <StatCard title="Pending" value={data.pendingPaise / 100} subtitle="paise" />
        <StatCard title="Overdue" value={data.overduePaise / 100} subtitle="paise" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-500">Charges</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">{data.counts.charges}</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-500">Occupancy</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {data.occupancy.unitsOccupied} / {data.occupancy.unitsTotal}
            </span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-500">Period</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">{data.period}</span>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h2>
        <div className="flex gap-4">
          <Badge variant="paid">Paid: {data.counts.paid}</Badge>
          <Badge variant="partial">Partial: {data.counts.partial}</Badge>
          <Badge variant="overdue">Overdue: {data.counts.overdue}</Badge>
          <Badge variant="pending">Pending: {data.counts.pending}</Badge>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Overdue Charges</h2>
        {data.overdueList.length === 0 ? (
          <p className="text-gray-500">No overdue charges.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-600">Tenant</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Unit</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Due Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-600 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.overdueList.map((item: { id: string; tenantName: string; unitLabel: string; dueDate: string; balancePaise: number }) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{item.tenantName}</td>
                    <td className="py-3 text-gray-900">{item.unitLabel}</td>
                    <td className="py-3 text-gray-600">{item.dueDate}</td>
                    <td className="py-3 text-right font-medium text-red-600">
                      {item.balancePaise / 100}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
