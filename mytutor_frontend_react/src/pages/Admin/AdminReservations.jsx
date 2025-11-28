import React, { useState, useEffect } from 'react';
import { horarioApi } from '../../api/horarioApi';
import { usuarioApi } from '../../api/usuarioApi';
import { tutorApi } from '../../api/tutorApi';

// Helper para ajustar fechas del backend (restar 5 horas)
const ajustarFechaBackend = (fechaISO) => {
  const fecha = new Date(fechaISO);
  fecha.setHours(fecha.getHours() - 5);
  return fecha;
};

const AdminReservations = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      console.log('📡 Cargando todas las reservas del sistema...');
      const horariosData = await horarioApi.listAllHorariosAdmin();
      console.log('📊 Horarios cargados:', horariosData);
      
      // Procesar horarios para extraer reservas
      const reservasList = [];
      
      for (const horario of horariosData) {
        if (horario.historialReservas && horario.historialReservas.length > 0) {
          // Obtener info del tutor para este horario
          let tutorNombre = 'Cargando...';
          let precioHora = 0;
          
          try {
            const tutorData = await tutorApi.getTutorById(horario.idTutor);
            tutorNombre = tutorData.nombre && tutorData.apellido 
              ? `${tutorData.nombre} ${tutorData.apellido}`
              : tutorData.correo || 'Tutor';
            precioHora = tutorData.precioHora || 0;
          } catch (error) {
            console.warn('⚠️ Error cargando tutor:', error);
            tutorNombre = horario.tutorNombreApellido || `ID: ${horario.idTutor}`;
            precioHora = horario.precioHora || 0;
          }
          
          for (const reserva of horario.historialReservas) {
            // Obtener info del estudiante
            let estudianteNombre = 'Cargando...';
            let estudianteEmail = '';
            try {
              const estudianteData = await usuarioApi.getUserById(reserva.idUsuario);
              estudianteNombre = estudianteData.nombre && estudianteData.apellido 
                ? `${estudianteData.nombre} ${estudianteData.apellido}`
                : estudianteData.nombreUsuario || 'Estudiante';
              estudianteEmail = estudianteData.correo || '';
            } catch (error) {
              console.warn('⚠️ Error cargando estudiante:', error);
              estudianteNombre = `ID: ${reserva.idUsuario}`;
            }
            
            console.log(`📋 Reserva procesada - Estado: ${reserva.estado}`);
            
            reservasList.push({
              id: `${horario.id}-${reserva.idUsuario}-${reserva.fecha}`,
              horarioId: horario.id,
              fechaInicio: horario.fechaInicio,
              fechaFin: horario.fechaFin,
              idTutor: horario.idTutor,
              tutorNombre: tutorNombre,
              idEstudiante: reserva.idUsuario,
              estudianteNombre: estudianteNombre,
              estudianteEmail: estudianteEmail,
              estado: reserva.estado,
              fechaReserva: reserva.fecha,
              precioHora: precioHora
            });
          }
        }
      }
      
      console.log('📊 Total reservas procesadas:', reservasList.length);
      console.log('📊 Estados encontrados:', [...new Set(reservasList.map(r => r.estado))]);
      setReservas(reservasList);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      alert('Error al cargar reservas: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredReservas = reservas.filter((reserva) => {
    // Filtrar por estado
    if (filter !== 'all') {
      // Unificar PENDIENTE y ESPERANDO_ACCION_TUTOR como "pendiente"
      if (filter === 'pendiente') {
        const esPendiente = reserva.estado === 'PENDIENTE' || reserva.estado === 'ESPERANDO_ACCION_TUTOR';
        if (!esPendiente) return false;
      } else {
        // Para otros filtros, comparación exacta
        if (reserva.estado !== filter) return false;
      }
    }
    
    // Filtrar por búsqueda
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const estudiante = reserva.estudianteNombre?.toLowerCase() || '';
    const tutor = reserva.tutorNombre?.toLowerCase() || '';
    const email = reserva.estudianteEmail?.toLowerCase() || '';
    const fecha = ajustarFechaBackend(reserva.fechaInicio).toLocaleDateString('es-ES');
    const estado = reserva.estado?.toLowerCase() || '';
    
    return estudiante.includes(search) || 
           tutor.includes(search) || 
           email.includes(search) ||
           fecha.includes(search) ||
           estado.includes(search);
  });

  console.log('🔍 Filtro activo:', filter);
  console.log('🔍 Total filtradas:', filteredReservas.length);

  if (loading) return <div className="loading">Cargando reservas...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>📅 Gestión de Reservas (Admin)</h1>

      <div className="card">
        {/* Barra de búsqueda */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar por estudiante, tutor, email, fecha o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ff9800',
              borderRadius: '8px'
            }}
          />
          {searchTerm && (
            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
              Encontradas <strong>{filteredReservas.length}</strong> reservas
            </p>
          )}
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px' }}
          >
            Todas ({reservas.length})
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={filter === 'pendiente' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px' }}
          >
            Pendientes ({reservas.filter(r => r.estado === 'PENDIENTE' || r.estado === 'ESPERANDO_ACCION_TUTOR').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETADA')}
            className={filter === 'COMPLETADA' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px' }}
          >
            Completadas ({reservas.filter(r => r.estado === 'COMPLETADA').length})
          </button>
          <button
            onClick={() => setFilter('NO_ASISTIO')}
            className={filter === 'NO_ASISTIO' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px' }}
          >
            No Asistió ({reservas.filter(r => r.estado === 'NO_ASISTIO').length})
          </button>
          <button
            onClick={() => setFilter('CANCELADA')}
            className={filter === 'CANCELADA' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px' }}
          >
            Canceladas ({reservas.filter(r => r.estado === 'CANCELADA').length})
          </button>
        </div>

        <p style={{ marginBottom: '20px', color: '#666' }}>
          Mostrando: <strong>{filteredReservas.length}</strong> reservas
          {filter !== 'all' && ` (${filter})`}
          {searchTerm && ` con "${searchTerm}"`}
        </p>
        
        {filteredReservas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            {reservas.length === 0 
              ? 'No hay reservas en el sistema' 
              : searchTerm 
                ? `No se encontraron reservas con "${searchTerm}"`
                : `No hay reservas con estado: ${filter}`}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fecha/Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Estudiante</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tutor</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Reservada</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map((reserva) => {
                  const fechaInicio = ajustarFechaBackend(reserva.fechaInicio);
                  const fechaFin = ajustarFechaBackend(reserva.fechaFin);
                  const duracion = Math.round((fechaFin - fechaInicio) / 60000);
                  
                  return (
                    <tr key={reserva.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <strong>{fechaInicio.toLocaleDateString('es-ES')}</strong>
                          <br />
                          <small style={{ color: '#666' }}>
                            {fechaInicio.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })} - {fechaFin.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </small>
                          <br />
                          <small style={{ color: '#999' }}>({duracion} min)</small>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <strong>{reserva.estudianteNombre}</strong>
                          {reserva.estudianteEmail && (
                            <>
                              <br />
                              <small style={{ color: '#666' }}>{reserva.estudianteEmail}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong>{reserva.tutorNombre}</strong>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: '#4caf50' }}>${reserva.precioHora}/h</strong>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          reserva.estado === 'COMPLETADA' ? 'badge-success' :
                          (reserva.estado === 'ESPERANDO_ACCION_TUTOR' || reserva.estado === 'PENDIENTE') ? 'badge-warning' :
                          reserva.estado === 'NO_ASISTIO' ? 'badge-secondary' :
                          reserva.estado === 'CANCELADA' ? 'badge-danger' : 'badge-info'
                        }`}>
                          {(reserva.estado === 'ESPERANDO_ACCION_TUTOR' || reserva.estado === 'PENDIENTE') ? 'PENDIENTE' : 
                           reserva.estado === 'NO_ASISTIO' ? 'NO ASISTIÓ' : reserva.estado}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <small style={{ color: '#999' }}>
                          {ajustarFechaBackend(reserva.fechaReserva).toLocaleDateString('es-ES')}
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
