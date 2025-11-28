import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        fontSize: '20px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    console.log('❌ AdminRoute: No hay usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ROLE_ADMIN') {
    console.log('❌ AdminRoute: Usuario no es admin, redirigiendo a dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AdminRoute: Usuario es admin, permitiendo acceso');
  return children;
};

export default AdminRoute;
