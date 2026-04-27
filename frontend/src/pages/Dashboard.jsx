import { useAuth } from '../context/AuthContext'
import StudentDashboard from './dashboards/StudentDashboard'
import TechnicianDashboard from './dashboards/TechnicianDashboard'
import AdminDashboard from './dashboards/AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'ADMIN') return <AdminDashboard />
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />
  return <StudentDashboard />
}
