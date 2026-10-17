import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Layout, ProtectedRoute } from './components/Navbar'
import { LoginPage, RegisterPage, DashboardPage, PropertiesPage, PropertyDetailPage, UnitsPage, TenantsPage, LeasesPage } from './pages'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
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
