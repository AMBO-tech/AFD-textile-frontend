import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoutes from './privateRoutes'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Login from '@/pages/auth/login'
import Register from '@/pages/auth/register'
import Home from '@/pages/home/home'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes Publiques / Authentification */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Routes Protégées / Dashboard */}
      <Route element={<PrivateRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          {/* Les modules métiers de l'équipe front viendront se brancher ici */}
        </Route>
      </Route>

      {/* Redirection fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
