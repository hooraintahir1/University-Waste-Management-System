import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './utils/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Workers from './pages/workers/Workers'
import Dustbins from './pages/dustbins/Dustbins'
import Waste from './pages/waste/Waste'
import Maintenance from './pages/maintenance/Maintenance'
import Salary from './pages/salary/Salary'
import Leave from './pages/leave/Leave'

const App = () => {
  const { user } = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<ProtectedRoute roles={['Manager']}><Register /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/workers"     element={<ProtectedRoute roles={['Manager','Admin']}><Workers /></ProtectedRoute>} />
          <Route path="/dustbins"    element={<Dustbins />} />
          <Route path="/waste"       element={<Waste />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/salary"      element={<ProtectedRoute roles={['Manager']}><Salary /></ProtectedRoute>} />
          <Route path="/leave"       element={<Leave />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
