import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Card, Badge } from '../components/ui'

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-medium text-[#5a6b5a]">{title}</h3>
      <div className="flex items-baseline mt-1">
        <span className="text-2xl font-bold text-[#1a1f1a]">{value}</span>
        <span className="text-xs text-[#8da58d] ml-1">{subtitle}</span>
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
        <p className="text-[#5a6b5a]">Loading dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    console.log('[Dashboard] Rendering error state:', error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#1a1f1a]">Dashboard</h1>
        <div className="mt-4 p-4 bg-[#fdecec] border border-[#f4c7c7] rounded text-[#b34545]">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-[#3d7a4f] hover:text-[#356b44] text-sm"
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
        <h1 className="text-2xl font-bold text-[#1a1f1a]">Dashboard</h1>
        <p className="mt-4 text-[#5a6b5a]">No data available.</p>
      </div>
    )
  }

  console.log('[Dashboard] Rendering data state:', data)

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f1a]">Dashboard</h1>
          <p className="text-[#5a6b5a] mt-1">
            Organization: {user?.orgId}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-2 bg-[#3d7a4f] text-white rounded-md text-sm hover:bg-[#356b44]">
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
          <h3 className="text-sm font-medium text-[#5a6b5a]">Charges</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-[#1a1f1a]">{data.counts.charges}</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-[#5a6b5a]">Occupancy</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-[#1a1f1a]">
              {data.occupancy.unitsOccupied} / {data.occupancy.unitsTotal}
            </span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-[#5a6b5a]">Period</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-[#1a1f1a]">{data.period}</span>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1a1f1a] mb-4">Status Breakdown</h2>
        <div className="flex gap-4">
          <Badge variant="paid">Paid: {data.counts.paid}</Badge>
          <Badge variant="partial">Partial: {data.counts.partial}</Badge>
          <Badge variant="overdue">Overdue: {data.counts.overdue}</Badge>
          <Badge variant="pending">Pending: {data.counts.pending}</Badge>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1a1f1a] mb-4">Overdue Charges</h2>
        {data.overdueList.length === 0 ? (
          <p className="text-[#5a6b5a]">No overdue charges.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e0e8de]">
                  <th className="pb-3 text-sm font-medium text-[#647c64]">Tenant</th>
                  <th className="pb-3 text-sm font-medium text-[#647c64]">Unit</th>
                  <th className="pb-3 text-sm font-medium text-[#647c64]">Due Date</th>
                  <th className="pb-3 text-sm font-medium text-[#647c64] text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.overdueList.map((item: { id: string; tenantName: string; unitLabel: string; dueDate: string; balancePaise: number }) => (
                  <tr key={item.id} className="border-b border-[#e8f0e6]">
                    <td className="py-3 text-[#1a1f1a]">{item.tenantName}</td>
                    <td className="py-3 text-[#1a1f1a]">{item.unitLabel}</td>
                    <td className="py-3 text-[#5a6b5a]">{item.dueDate}</td>
                    <td className="py-3 text-right font-medium text-[#b34545]">
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
