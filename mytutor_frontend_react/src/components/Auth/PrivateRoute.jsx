import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🔒 PrivateRoute - Loading:', loading, 'User:', user ? user.nombre : 'No existe');
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '24px',
        color: '#666',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>📚</div>
        <div>Cargando MyTutor...</div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ PrivateRoute - No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ PrivateRoute - Usuario autenticado, mostrando contenido');
  return children;
};

export default PrivateRoute;
