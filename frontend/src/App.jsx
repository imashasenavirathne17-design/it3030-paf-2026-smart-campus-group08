import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import Landing     from './pages/Landing'
import Login       from './pages/Login'
import Signup      from './pages/Signup'
import Dashboard   from './pages/Dashboard'
import Resources   from './pages/resources/Resources'
import Bookings    from './pages/bookings/Bookings'
import Tickets     from './pages/tickets/Tickets'
import TicketDetail from './pages/tickets/TicketDetail'
import Notifications from './pages/Notifications'
import UsersManagement from './pages/UsersManagement'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected — inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/resources"       element={<Resources />} />
              <Route path="/bookings"        element={<Bookings />} />
              <Route path="/tickets"         element={<Tickets />} />
              <Route path="/tickets/:id"     element={<TicketDetail />} />
              <Route path="/notifications"   element={<Notifications />} />
              <Route path="/users"           element={<UsersManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
