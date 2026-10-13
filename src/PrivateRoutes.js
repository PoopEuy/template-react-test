import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const PrivateRoutes = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  if (requiredPermission && !user.permissions?.some((p) => requiredPermission.includes(p.name))) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default PrivateRoutes
