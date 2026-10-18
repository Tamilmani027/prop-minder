import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
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
  const { user, token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[Dashboard] useEffect triggered, token:', token?.substring(0, 20) + '...')

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('[Dashboard] Fetching /api/v1/dashboard')

        const res = await api.get('/dashboard')
        console.log('[Dashboard] Response:', res.status, res.data)

        // Backend wraps response in { data: {...} }
        setData(res.data.data)
      } catch (err: any) {
        console.error('[Dashboard] Error:', err.response?.status, err.message)
        setError(err.response?.data?.error?.message || err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  // Loading state
  if (loading) {
    console.log('[Dashboard] Rendering loading state')
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    console.log('[Dashboard] Rendering error state:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-blue-600 hover:text-blue-500 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data
  if (!data) {
    console.log('[Dashboard] Rendering no-data state')
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-4 text-gray-500">No data available.</p>
      </div>
    )
  }

  console.log('[Dashboard] Rendering data state:', data)

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
