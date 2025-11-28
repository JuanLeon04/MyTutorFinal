import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tutorApi } from '../../api/tutorApi';
import { reservaApi } from '../../api/reservaApi';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [stats, setStats] = useState({
    reservasPendientes: 0,
    reservasCompletadas: 0,
    totalReservas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo cargar stats si NO es admin
    if (role !== 'ROLE_ADMIN') {
      checkTutorStatus();
      loadStats();
    } else {
      setLoading(false);
    }
  }, [role]);

  const checkTutorStatus = async () => {
    try {
      const tutorData = await tutorApi.getMyTutorProfile();
      console.log('✅ Usuario es tutor:', tutorData);
      setIsTutor(true);
    } catch (error) {
      // 403 significa que no es tutor, esto es normal
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('ℹ️ Usuario no es tutor (esto es normal)');
        setIsTutor(false);
      } else {
        console.error('❌ Error verificando estado de tutor:', error);
        setIsTutor(false);
      }
    }
  };

  const loadStats = async () => {
    // Solo cargar estadísticas si NO es admin
    if (role === 'ROLE_ADMIN') {
      setLoading(false);
      return;
    }

    try {
      const horariosData = await reservaApi.getMyReservas();
      console.log('📊 Horarios con reservas:', horariosData);
      
      // Procesar horarios para obtener las reservas
      const reservasList = [];
      horariosData.forEach(horario => {
        if (horario.historialReservas && horario.historialReservas.length > 0) {
          horario.historialReservas.forEach(reserva => {
            reservasList.push({
              estado: reserva.estado,
              fecha: reserva.fecha
            });
          });
        }
      });
      
      console.log('📊 Reservas procesadas:', reservasList.length);
      
      setStats({
        reservasPendientes: reservasList.filter(r => 
          r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA' || r.estado === 'ESPERANDO_ACCION_TUTOR'
        ).length,
        reservasCompletadas: reservasList.filter(r => 
          r.estado === 'COMPLETADA'
        ).length,
        totalReservas: reservasList.length
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header de bienvenida */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#2c3e50' }}>
          {role === 'ROLE_ADMIN' ? '🔧 Panel de Administración' : `¡Bienvenido, ${user?.nombre || user?.nombreUsuario}! 👋`}
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          {role === 'ROLE_ADMIN' ? 'Gestiona toda la plataforma MyTutor' : '¿Qué te gustaría hacer hoy?'}
        </p>
      </div>

      {role === 'ROLE_ADMIN' ? (
        // Panel exclusivo para Admin
        <>
          {/* Estadísticas de administración */}
          <div className="grid-3" style={{ marginBottom: '40px' }}>
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#e3f2fd', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Usuarios</p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#e8f5e9', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍🏫</div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Tutores</p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#fff3e0', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Reservas</p>
            </div>
          </div>

          {/* Módulos de administración */}
          <div className="grid-2" style={{ gap: '30px', marginBottom: '40px' }}>
            {/* Gestión de Usuarios */}
            <div className="card">
              <h2 style={{ fontSize: '24px', color: '#2196f3', marginBottom: '15px' }}>
                👥 Gestión de Usuarios
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                Administra todos los usuarios registrados en la plataforma
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                    📋 Ver Todos los Usuarios
                  </button>
                </Link>
              </div>
            </div>

            {/* Gestión de Tutores */}
            <div className="card">
              <h2 style={{ fontSize: '24px', color: '#4caf50', marginBottom: '15px' }}>
                👨‍🏫 Gestión de Tutores
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                Supervisa y administra todos los tutores activos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/tutors" style={{ textDecoration: 'none' }}>
                  <button className="btn-success" style={{ width: '100%', padding: '12px' }}>
                    📋 Ver Todos los Tutores
                  </button>
                </Link>
              </div>
            </div>

            {/* Gestión de Reservas */}
            <div className="card">
              <h2 style={{ fontSize: '24px', color: '#ff9800', marginBottom: '15px' }}>
                📅 Gestión de Reservas
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                Monitorea todas las reservas y tutorías de la plataforma
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/reservations" style={{ textDecoration: 'none' }}>
                  <button className="btn-warning" style={{ width: '100%', padding: '12px' }}>
                    📋 Ver Todas las Reservas
                  </button>
                </Link>
              </div>
            </div>

            {/* Gestión de Reseñas */}
            <div className="card">
              <h2 style={{ fontSize: '24px', color: '#9c27b0', marginBottom: '15px' }}>
                ⭐ Gestión de Reseñas
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                Supervisa y modera las reseñas de los tutores
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/reviews" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '12px', backgroundColor: '#9c27b0' }}>
                    📋 Ver Todas las Reseñas
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Panel normal para usuarios
        <>
          {/* Estadísticas rápidas */}
          <div className="grid-3" style={{ marginBottom: '50px' }}>
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#e3f2fd', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1976d2', marginBottom: '10px' }}>
                {stats.reservasPendientes}
              </div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0 }}>Reservas Pendientes</p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#e8f5e9', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#388e3c', marginBottom: '10px' }}>
                {stats.reservasCompletadas}
              </div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0 }}>Tutorías Completadas</p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#fff3e0', 
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f57c00', marginBottom: '10px' }}>
                {stats.totalReservas}
              </div>
              <p style={{ color: '#555', fontSize: '16px', margin: 0 }}>Total de Reservas</p>
            </div>
          </div>

          {/* Secciones principales */}
          <div className="grid-2" style={{ gap: '30px', marginBottom: '40px' }}>
            {/* Panel de Estudiante */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '35px',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '28px', color: '#2196f3', marginBottom: '10px' }}>
                  🎓 Como Estudiante
                </h2>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
                  Encuentra tutores expertos en diversas materias y reserva sesiones personalizadas
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Link to="/tutors" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}>
                    🔍 Buscar Tutores
                  </button>
                </Link>
                
                <Link to="/my-reservations" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#616161'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#757575'}>
                    📅 Ver Mis Reservas
                  </button>
                </Link>
                
                <Link to="/my-reviews" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#616161'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#757575'}>
                    ⭐ Mis Reseñas
                  </button>
                </Link>
              </div>
            </div>

            {/* Panel de Tutor */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '35px',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '28px', color: '#4caf50', marginBottom: '10px' }}>
                  👨‍🏫 Como Tutor
                </h2>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
                  {isTutor 
                    ? 'Gestiona tu perfil, horarios y tutorías programadas'
                    : 'Comparte tus conocimientos y gana dinero ayudando a otros estudiantes'}
                </p>
              </div>
              
              {isTutor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <Link to="/my-tutor-profile" style={{ textDecoration: 'none' }}>
                    <button style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#388e3c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}>
                      👤 Mi Perfil de Tutor
                    </button>
                  </Link>
                  
                  <Link to="/my-schedule" style={{ textDecoration: 'none' }}>
                    <button style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      backgroundColor: '#757575',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#616161'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#757575'}>
                      🕐 Gestionar Horarios
                    </button>
                  </Link>
                  
                  <Link to="/my-tutorias" style={{ textDecoration: 'none' }}>
                    <button style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      backgroundColor: '#757575',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#616161'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#757575'}>
                      📚 Mis Tutorías Programadas
                    </button>
                  </Link>
                </div>
              ) : (
                <Link to="/become-tutor" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    padding: '20px',
                    fontSize: '18px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#388e3c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}>
                    ✨ Convertirse en Tutor
                  </button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
