import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservaApi } from '../../api/reservaApi';
import { resenaApi } from '../../api/resenaApi';
import { tutorApi } from '../../api/tutorApi';

// Helper para ajustar fechas del backend (restar 5 horas)
const ajustarFechaBackend = (fechaISO) => {
  const fecha = new Date(fechaISO);
  fecha.setHours(fecha.getHours() - 5);
  return fecha;
};

const MyReservations = () => {
  const [reservas, setReservas] = useState([]);
  const [misResenas, setMisResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadReservas(), loadMisResenas()]);
  };

  const loadMisResenas = async () => {
    try {
      const resenasData = await resenaApi.getMyResenas();
      console.log('📊 Mis reseñas:', resenasData);
      setMisResenas(resenasData);
    } catch (error) {
      console.error('Error cargando mis reseñas:', error);
    }
  };

  const loadReservas = async () => {
    try {
      const horariosData = await reservaApi.getMyReservas();
      console.log('📊 Mis reservas:', horariosData);
      
      // Procesar horarios para extraer reservas
      const reservasList = [];
      
      for (const horario of horariosData) {
        if (horario.historialReservas && horario.historialReservas.length > 0) {
          // Obtener info del tutor
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
          
          // Solo tomar la última reserva del historial (la más reciente)
          const ultimaReserva = horario.historialReservas[horario.historialReservas.length - 1];
          
          reservasList.push({
            id: horario.id,
            fechaInicio: horario.fechaInicio,
            fechaFin: horario.fechaFin,
            idTutor: horario.idTutor,
            tutorNombre: tutorNombre,
            estado: ultimaReserva.estado,
            fechaReserva: ultimaReserva.fecha,
            precioHora: precioHora
          });
        }
      }
      
      console.log('📊 Reservas procesadas:', reservasList);
      console.log('📊 Estados únicos:', [...new Set(reservasList.map(r => r.estado))]);
      setReservas(reservasList);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si ya se hizo una reseña para un horario específico
  const yaHiceResena = (horarioId, tutorId) => {
    if (!misResenas || misResenas.length === 0) return false;
    // Verificar si existe una reseña con el mismo tutor
    const reseñaExiste = misResenas.some(resena => resena.dHorario !== undefined && resena.idHorario !== null);
    console.log(`🔍 Verificando reseña - Horario: ${horarioId}, Tutor: ${tutorId}, Existe: ${reseñaExiste}`);
    if (reseñaExiste) {
      return misResenas.some(resena => String(resena.idHorario) === String(horarioId));
    }
    console.warn('yaHiceResena: no se encontró idHorario en resenas, usando fallback por idTutor');
    return misResenas.some(r => String(r.idTutor) === String(tutorId));
  };

  const handleCancelReserva = async (horarioId, reserva) => {
    const fechaInicio = ajustarFechaBackend(reserva.fechaInicio);
    const ahora = new Date();
    const horasRestantes = (fechaInicio - ahora) / (1000 * 60 * 60);
    
    if (horasRestantes < 24) {
      alert(
        `⚠️ NO SE PUEDE CANCELAR\n\n` +
        `Solo puedes cancelar con al menos 24 horas de anticipación.\n\n` +
        `Tiempo restante: ${Math.round(horasRestantes)} horas`
      );
      return;
    }

    if (window.confirm(
      `¿Estás seguro de cancelar esta reserva?\n\n` +
      `Tutor: ${reserva.tutorNombre}\n` +
      `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
      `Tiempo restante: ${Math.round(horasRestantes)} horas`
    )) {
      try {
        await reservaApi.cancelReserva(horarioId);
        alert('✅ Reserva cancelada exitosamente');
        loadReservas();
      } catch (error) {
        console.error('Error al cancelar:', error);
        const errorMsg = error.response?.data?.message || error.response?.data || 'Error al cancelar';
        alert(`❌ No se pudo cancelar:\n\n${errorMsg}`);
      }
    }
  };

  const handleCrearResena = async (horarioId, tutorId) => {
    // Buscar la reserva específica
    const reserva = reservas.find(r => r.id === horarioId);
    
    if (!reserva) {
      alert('❌ Reserva no encontrada');
      return;
    }
    
    // Verificar si ya se hizo reseña
    if (yaHiceResena(horarioId, tutorId)) {
      alert('ℹ️ Ya has dejado una reseña para este tutor');
      return;
    }
    
    console.log('📍 Navegando a crear reseña con:');
    console.log('  - horarioId:', horarioId);
    console.log('  - tutorId:', tutorId);
    console.log('  - tutorNombre:', reserva.tutorNombre);
    
    // Navegar a la página de crear reseña
    navigate('/create-review', { 
      state: { 
        horarioId: horarioId, 
        tutorId: tutorId,
        tutorNombre: reserva.tutorNombre
      } 
    });
  };

  const handleCancelar = async (horarioId) => {
    if (window.confirm(
      '⚠️ ¿Estás seguro de que deseas cancelar esta reserva?\n\n' +
      'Esta acción no se puede deshacer.'
    )) {
      try {
        console.log('❌ Cancelando reserva ID:', horarioId);
        await reservaApi.cancelReserva(horarioId);
        alert('✅ Reserva cancelada exitosamente');
        await loadReservas();
      } catch (error) {
        console.error('❌ Error al cancelar reserva:', error);
        alert(`❌ Error: ${error.response?.data?.message || error.response?.data || error.message}`);
      }
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
    
    return true;
  });

  console.log('📊 Filtro activo:', filter);
  console.log('📊 Total reservas:', reservas.length);
  console.log('📊 Total filtradas:', filteredReservas.length);
  console.log('📊 Estados en todas:', reservas.map(r => r.estado));
  console.log('📊 Estados filtradas:', filteredReservas.map(r => r.estado));

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: 'badge-warning',
      CONFIRMADA: 'badge-info',
      COMPLETADA: 'badge-success',
      CANCELADA: 'badge-danger'
    };
    return badges[estado] || 'badge-info';
  };

  if (loading) return <div className="loading">Cargando tus reservas...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>📅 Mis Reservas</h1>

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

      {/* Lista de reservas */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredReservas.length === 0 ? (
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p>No tienes reservas {filter}s</p>
            {filter === 'all' && (
              <Link to="/tutors" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '12px 30px' }}>
                  Buscar Tutores
                </button>
              </Link>
            )}
          </div>
        ) : (
          filteredReservas.map((reserva) => {
            const fechaInicio = ajustarFechaBackend(reserva.fechaInicio);
            const fechaFin = ajustarFechaBackend(reserva.fechaFin);
            const duracion = Math.round((fechaFin - fechaInicio) / 60000);
            
            return (
              <div key={reserva.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ marginBottom: '5px' }}>👨‍🏫 {reserva.tutorNombre}</h3>
                    <span className={`badge ${
                      reserva.estado === 'COMPLETADA' ? 'badge-success' :
                      (reserva.estado === 'PENDIENTE' || reserva.estado === 'ESPERANDO_ACCION_TUTOR') ? 'badge-warning' :
                      reserva.estado === 'NO_ASISTIO' ? 'badge-secondary' :
                      reserva.estado === 'CANCELADA' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {(reserva.estado === 'PENDIENTE' || reserva.estado === 'ESPERANDO_ACCION_TUTOR') ? 'PENDIENTE' : 
                       reserva.estado === 'NO_ASISTIO' ? 'NO ASISTIÓ' : reserva.estado}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50', margin: '0' }}>
                      💰 ${reserva.precioHora}/hora
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    📅 <strong>Fecha:</strong> {fechaInicio.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    🕐 <strong>Hora:</strong> {fechaInicio.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })} - {fechaFin.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    ⏱️ <strong>Duración:</strong> {duracion} minutos
                  </p>
                </div>

                {reserva.estado === 'COMPLETADA' && (
                  <div style={{ marginTop: '15px' }}>
                    {yaHiceResena(reserva.id, reserva.idTutor) ? (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: '8px',
                        border: '1px solid #4caf50'
                      }}>
                        <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px', fontWeight: 'bold' }}>
                          ✅ Ya dejaste una reseña para este tutor
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCrearResena(reserva.id, reserva.idTutor)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                      >
                        ⭐ Dejar Reseña
                      </button>
                    )}
                  </div>
                )}

                {(reserva.estado === 'PENDIENTE' || reserva.estado === 'ESPERANDO_ACCION_TUTOR') && (
                  <button
                    onClick={() => handleCancelar(reserva.id)}
                    className="btn-danger"
                    style={{ width: '100%', padding: '12px', marginTop: '15px' }}
                  >
                    ❌ Cancelar Reserva
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyReservations;
