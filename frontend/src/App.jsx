import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import OAuth2Callback from './pages/OAuth2Callback'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets/AssetList'
import Bookings from './pages/bookings/Bookings' // Using my advanced Bookings module
import Tickets from './pages/Tickets/TicketList'
import Notifications from './pages/Notifications/NotificationPanel'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-bg" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuth2Callback />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
