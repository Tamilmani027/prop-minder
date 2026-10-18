import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Layout, ProtectedRoute } from './components/Navbar'
import { LoginPage, RegisterPage, DashboardPage, PropertiesPage, PropertyDetailPage, UnitsPage, TenantsPage, LeasesPage, LandingPage } from './pages'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/properties/:propertyId/units" element={<UnitsPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/leases" element={<LeasesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
