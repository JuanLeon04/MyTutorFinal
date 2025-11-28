import React, { useState, useEffect } from 'react';
import { horarioApi } from '../../api/horarioApi';
import { reservaApi } from '../../api/reservaApi';

// Helper para ajustar fechas del backend (restar 5 horas)
const ajustarFechaBackend = (fechaISO) => {
  const fecha = new Date(fechaISO);
  fecha.setHours(fecha.getHours() - 5);
  return fecha;
};

const MyTutorias = () => {
  const [tutorias, setTutorias] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorias();
  }, []);

  const loadTutorias = async () => {
    try {
      const horariosData = await horarioApi.getMyHorarios();
      console.log('📊 Mis horarios como tutor:', horariosData);
      
      // Procesar horarios para extraer tutorías con reservas
      const tutoriasList = [];
      
      for (const horario of horariosData) {
        if (horario.historialReservas && horario.historialReservas.length > 0) {
          // Tomar la última reserva (estado actual)
          const ultimaReserva = horario.historialReservas[horario.historialReservas.length - 1];
          
          tutoriasList.push({
            id: horario.id,
            fechaInicio: horario.fechaInicio,
            fechaFin: horario.fechaFin,
            disponible: horario.disponible,
            idUsuario: ultimaReserva.idUsuario,
            estado: ultimaReserva.estado,
            fechaReserva: ultimaReserva.fecha
          });
        }
      }
      
      console.log('📊 Tutorías procesadas:', tutoriasList);
      setTutorias(tutoriasList);
    } catch (error) {
      console.error('Error cargando tutorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarReserva = async (horarioId) => {
    if (window.confirm('¿Confirmas esta reserva? El estudiante será notificado.')) {
      try {
        // Aquí el backend debería tener un endpoint para confirmar
        // Por ahora usamos el endpoint de completada temporalmente
        alert('⚠️ Función de confirmar: Debes implementar el endpoint en el backend para cambiar estado a CONFIRMADA');
        // await reservaApi.confirmarReserva(horarioId);
        loadTutorias();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al confirmar');
      }
    }
  };

  const handleRechazarReserva = async (horarioId) => {
    const tutoria = tutorias.find(t => t.horarioId === horarioId);
    const fechaInicio = ajustarFechaBackend(tutoria.fechaInicio);
    
    if (window.confirm(
      `¿Confirmas que deseas rechazar esta reserva?\n\n` +
      `Estudiante: ${tutoria.estudianteNombre}\n` +
      `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
      `Hora: ${fechaInicio.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`
    )) {
      try {
        await reservaApi.cancelReserva(horarioId);
        alert('✅ Reserva rechazada exitosamente');
        await loadTutorias();
      } catch (error) {
        console.error('❌ Error al rechazar:', error);
        const errorMsg = error.response?.data || error.message;
        
        if (errorMsg.includes('no hiciste')) {
          alert(
            `❌ LIMITACIÓN DEL BACKEND\n\n` +
            `El backend actualmente NO permite que los tutores rechacen reservas.\n\n` +
            `Solo el estudiante que hizo la reserva puede cancelarla.\n\n` +
            `SOLUCIÓN NECESARIA EN EL BACKEND:\n` +
            `Modificar el endpoint DELETE /api/reserva/{idHorario} para:\n\n` +
            `✅ Permitir que el TUTOR del horario rechace\n` +
            `✅ Permitir que el ESTUDIANTE cancele (con 24h)\n\n` +
            `Por ahora, contacta al estudiante:\n` +
            `${tutoria.estudianteNombre}\n` +
            `${tutoria.estudianteEmail || 'Email no disponible'}`
          );
        } else {
          alert(`❌ Error al rechazar:\n\n${errorMsg}`);
        }
      }
    }
  };

  const handleMarcarCompletada = async (tutoriaId) => {
    const tutoria = tutorias.find(t => t.id === tutoriaId);
    
    if (!tutoria) {
      alert('❌ Tutoría no encontrada');
      return;
    }

    const fechaInicio = ajustarFechaBackend(tutoria.fechaInicio);
    const fechaHoy = new Date();

    if (fechaInicio > fechaHoy) {
      alert('⚠️ No puedes marcar como completada una tutoría que aún no ha ocurrido');
      return;
    }

    if (window.confirm(
      '¿Estás seguro de marcar esta tutoría como completada?\n\n' +
      `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
      `Hora: ${fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    )) {
      try {
        await reservaApi.marcarCompletada(tutoriaId);
        alert('✅ Tutoría marcada como completada');
        await loadTutorias();
      } catch (error) {
        console.error('Error marcando como completada:', error);
        alert('❌ Error: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleMarcarNoAsistio = async (tutoriaId) => {
    const tutoria = tutorias.find(t => t.id === tutoriaId);
    
    if (!tutoria) {
      alert('❌ Tutoría no encontrada');
      return;
    }

    const fechaInicio = ajustarFechaBackend(tutoria.fechaInicio);
    const fechaHoy = new Date();

    if (fechaInicio > fechaHoy) {
      alert('⚠️ No puedes marcar como "No Asistió" una tutoría que aún no ha ocurrido');
      return;
    }

    if (window.confirm(
      '¿Estás seguro de marcar que el estudiante NO asistió a esta tutoría?\n\n' +
      `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
      `Hora: ${fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    )) {
      try {
        await reservaApi.marcarNoAsistio(tutoriaId);
        alert('✅ Tutoría marcada como "No Asistió"');
        await loadTutorias();
      } catch (error) {
        console.error('Error marcando como no asistió:', error);
        alert('❌ Error: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleCancelarTutoria = async (tutoriaId) => {
    const tutoria = tutorias.find(t => t.id === tutoriaId);
    
    if (!tutoria) {
      alert('❌ Tutoría no encontrada');
      return;
    }

    const fechaInicio = ajustarFechaBackend(tutoria.fechaInicio);
    const fechaHoy = new Date();
    const unDiaEnMs = 24 * 60 * 60 * 1000;
    const diferencia = fechaInicio - fechaHoy;

    // Verificar que falte más de 1 día
    if (diferencia < unDiaEnMs) {
      alert('⚠️ Solo puedes cancelar reservas con al menos 1 día de anticipación');
      return;
    }

    if (window.confirm(
      '⚠️ ¿Estás seguro de cancelar esta tutoría?\n\n' +
      `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
      `Hora: ${fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      'El estudiante será notificado de la cancelación.'
    )) {
      try {
        await reservaApi.cancelReservaTutor(tutoriaId);
        alert('✅ Tutoría cancelada exitosamente');
        await loadTutorias();
      } catch (error) {
        console.error('Error cancelando tutoría:', error);
        const errorMsg = error.response?.data || error.message;
        
        if (typeof errorMsg === 'string' && errorMsg.includes('1 día')) {
          alert('⚠️ Solo puedes cancelar reservas con al menos 1 día de anticipación');
        } else {
          alert('❌ Error: ' + errorMsg);
        }
      }
    }
  };

  const filteredTutorias = tutorias.filter((tutoria) => {
    // Filtrar por estado
    if (filter !== 'all') {
      // Unificar PENDIENTE y ESPERANDO_ACCION_TUTOR como "pendiente"
      if (filter === 'pendiente') {
        const esPendiente = tutoria.estado === 'PENDIENTE' || tutoria.estado === 'ESPERANDO_ACCION_TUTOR';
        if (!esPendiente) return false;
      } else {
        // Para otros filtros, comparación exacta
        if (tutoria.estado !== filter) return false;
      }
    }
    
    return true;
  });

  console.log('📊 Filtro activo:', filter);
  console.log('📊 Total tutorías:', tutorias.length);
  console.log('📊 Total filtradas:', filteredTutorias.length);
  console.log('📊 Estados en todas:', tutorias.map(t => t.estado));
  console.log('📊 Estados filtradas:', filteredTutorias.map(t => t.estado));

  if (loading) return <div className="loading">Cargando tutorías...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>📚 Mis Tutorías Programadas</h1>

      {/* Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 16px' }}
        >
          Todas ({tutorias.length})
        </button>
        <button
          onClick={() => setFilter('pendiente')}
          className={filter === 'pendiente' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 16px' }}
        >
          Pendientes ({tutorias.filter(t => t.estado === 'PENDIENTE' || t.estado === 'ESPERANDO_ACCION_TUTOR').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETADA')}
          className={filter === 'COMPLETADA' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 16px' }}
        >
          Completadas ({tutorias.filter(t => t.estado === 'COMPLETADA').length})
        </button>
        <button
          onClick={() => setFilter('NO_ASISTIO')}
          className={filter === 'NO_ASISTIO' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 16px' }}
        >
          No Asistió ({tutorias.filter(t => t.estado === 'NO_ASISTIO').length})
        </button>
        <button
          onClick={() => setFilter('CANCELADA')}
          className={filter === 'CANCELADA' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 16px' }}
        >
          Canceladas ({tutorias.filter(t => t.estado === 'CANCELADA').length})
        </button>
      </div>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Mostrando: <strong>{filteredTutorias.length}</strong> tutorías
        {filter !== 'all' && ` (${filter === 'pendiente' ? 'PENDIENTE' : filter})`}
      </p>

      {/* Lista de tutorías */}
      {filteredTutorias.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            {tutorias.length === 0 
              ? '📭 No tienes tutorías programadas aún. Los estudiantes que reserven tus horarios aparecerán aquí.' 
              : `No tienes tutorías ${filter !== 'all' ? filter + 's' : ''}`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredTutorias.map((tutoria) => {
            const fechaInicio = ajustarFechaBackend(tutoria.fechaInicio);
            const fechaFin = ajustarFechaBackend(tutoria.fechaFin);
            const duracion = Math.round((fechaFin - fechaInicio) / 60000);
            
            return (
              <div key={tutoria.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ marginBottom: '10px' }}>Tutoría Programada</h3>
                    <span className={`badge ${
                      tutoria.estado === 'COMPLETADA' ? 'badge-success' :
                      (tutoria.estado === 'PENDIENTE' || tutoria.estado === 'ESPERANDO_ACCION_TUTOR') ? 'badge-warning' :
                      tutoria.estado === 'NO_ASISTIO' ? 'badge-secondary' :
                      tutoria.estado === 'CANCELADA' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {(tutoria.estado === 'PENDIENTE' || tutoria.estado === 'ESPERANDO_ACCION_TUTOR') ? 'PENDIENTE' : 
                       tutoria.estado === 'NO_ASISTIO' ? 'NO ASISTIÓ' : tutoria.estado}
                    </span>
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
                  <p style={{ margin: '5px 0', color: '#999', fontSize: '14px' }}>
                    👨‍🎓 <strong>ID Estudiante:</strong> {tutoria.idUsuario}
                  </p>
                </div>

                {(tutoria.estado === 'PENDIENTE' || tutoria.estado === 'ESPERANDO_ACCION_TUTOR') && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleMarcarCompletada(tutoria.id)}
                        className="btn-success"
                        style={{ flex: 1, padding: '12px' }}
                      >
                        ✅ Marcar Completada
                      </button>
                      <button
                        onClick={() => handleMarcarNoAsistio(tutoria.id)}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '12px' }}
                      >
                        ❌ No Asistió
                      </button>
                    </div>
                    <button
                      onClick={() => handleCancelarTutoria(tutoria.id)}
                      className="btn-danger"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      🚫 Cancelar Tutoría
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTutorias;
