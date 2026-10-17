import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { LogOut, LayoutDashboard, Building2, Home, User, FileText } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">PropMinder</span>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <Home className="h-4 w-4 mr-2" /> Properties
            </NavLink>
            <NavLink
              to="/tenants"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <User className="h-4 w-4 mr-2" /> Tenants
            </NavLink>
            <NavLink
              to="/leases"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              <FileText className="h-4 w-4 mr-2" /> Leases
            </NavLink>

            <div className="ml-4 flex items-center gap-3">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <Button onClick={handleLogout} variant="danger">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return null

  if (!user) {
    navigate('/login')
    return null
  }

  return <>{children}</>
}
