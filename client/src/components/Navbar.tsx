import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { LogOut, LayoutDashboard, Home, User, FileText, Menu, X } from 'lucide-react'
import logo from '../assets/logo.svg'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const navLinks = (
    <>
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-white bg-[#3d7a4f]'
            : 'text-[#a8b5a8] hover:text-white'
          }`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
      </NavLink>
      <NavLink
        to="/properties"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-white bg-[#3d7a4f]'
            : 'text-[#a8b5a8] hover:text-white'
          }`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Home className="h-4 w-4 mr-2" /> Properties
      </NavLink>
      <NavLink
        to="/tenants"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-white bg-[#3d7a4f]'
            : 'text-[#a8b5a8] hover:text-white'
          }`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <User className="h-4 w-4 mr-2" /> Tenants
      </NavLink>
      <NavLink
        to="/leases"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'text-white bg-[#3d7a4f]'
            : 'text-[#a8b5a8] hover:text-white'
          }`
        }
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <FileText className="h-4 w-4 mr-2" /> Leases
      </NavLink>
    </>
  )

  return (
    <nav className="bg-[#1a1f1a] shadow-lg border-b border-[#2a3328]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="PropMinder logo" className="w-8 h-8" />
            <span className="text-white font-semibold text-[17px] tracking-[-0.01em]">
              propminder
            </span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">{navLinks}</div>

          {/* Desktop user area */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[#a8b5a8] text-sm">{user?.name}</span>
            <Button onClick={handleLogout} variant="danger" className="text-xs px-3 py-1.5">
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign out
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white hover:text-[#a8b5a8] transition-colors"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile navigation overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#1a1f1a] border-t border-[#2a3328]">
            <div className="px-4 py-4 space-y-2">
              {navLinks}
              <div className="pt-4 border-t border-[#2a3328] flex items-center gap-3">
                <span className="text-[#a8b5a8] text-sm">{user?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="danger"
                  className="text-xs px-3 py-1.5 w-full"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate, isLoading])

  if (isLoading) return null

  if (!user) return null

  return <>{children}</>
}
