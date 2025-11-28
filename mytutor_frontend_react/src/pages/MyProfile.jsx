import React, { useState, useEffect } from 'react';
import { horarioApi } from '../../api/horarioApi';
import { usuarioApi } from '../api/usuarioApi';

// Helper para ajustar fechas del backend (restar 5 horas)
const ajustarFechaBackend = (fechaISO) => {
  const fecha = new Date(fechaISO);
  fecha.setHours(fecha.getHours() - 5);
  return fecha;
};

const ManageSchedule = () => {
  const [horarios, setHorarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fechaInicio: '',
    horaInicio: '',
    duracionMinutos: 60
  });
  const [loading, setLoading] = useState(true);
  const [horariosPasados, setHorariosPasados] = useState([]);

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      const data = await horarioApi.listAllHorarios();
      console.log('📊 Todos los horarios recibidos:', data.length);
      console.log('📊 Datos completos:', JSON.stringify(data, null, 2));
      
      // Filtrar horarios ACTIVOS (no desactivados)
      // El backend debería tener un campo 'activo' o 'estado'
      const horariosActivos = data.filter(h => {
        // Opciones según lo que devuelva el backend:
        // 1. Si tiene campo 'activo': return h.activo !== false;
        // 2. Si tiene campo 'estado': return h.estado !== 'DESACTIVADO';
        // 3. Si no tiene estos campos, mostrar todos
        
        // Por ahora, verifica si existe alguno de estos campos
        if (h.hasOwnProperty('activo')) {
          return h.activo === true;
        }
        if (h.hasOwnProperty('estado')) {
          return h.estado !== 'DESACTIVADO' && h.estado !== 'ELIMINADO';
        }
        // Si no tiene ningún campo, mostrar todos (el backend debería filtrar)
        return true;
      });
      
      console.log('📊 Horarios activos después del filtro:', horariosActivos.length);
      
      // Obtener fecha actual
      const ahora = new Date();
      
      // Separar horarios en futuros y pasados
      const horariosPasados = horariosActivos.filter(horario => {
        const fechaFin = ajustarFechaBackend(horario.fechaFin);
        return fechaFin < ahora;
      });
      
      console.log('📊 Horarios pasados:', horariosPasados.length);
      
      setHorarios(horariosActivos);
      setHorariosPasados(horariosPasados);
      
    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      alert('Error al cargar horarios: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarPasados = async () => {
    if (horariosPasados.length === 0) {
      alert('✅ No hay horarios pasados para eliminar');
      return;
    }
    
    if (!window.confirm(
      `¿Deseas eliminar ${horariosPasados.length} horario(s) que ya pasaron?\n\n` +
      `Esto ayudará a mantener tu lista limpia y organizada.`
    )) {
      return;
    }
    
    let eliminados = 0;
    let errores = 0;
    
    for (const horario of horariosPasados) {
      try {
        await horarioApi.deleteHorario(horario.id);
        eliminados++;
      } catch (error) {
        console.error('Error eliminando horario:', horario.id, error);
        errores++;
      }
    }
    
    if (eliminados > 0) {
      alert(`✅ Se eliminaron ${eliminados} horario(s) pasado(s).${errores > 0 ? `\n⚠️ ${errores} no pudieron eliminarse.` : ''}`);
      await loadHorarios();
    } else {
      alert('❌ No se pudo eliminar ningún horario');
    }
  };

  const handleCreateHorario = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener la hora actual del sistema
      const ahora = new Date();
      
      // Construir la fecha seleccionada
      const [year, month, day] = formData.fechaInicio.split('-').map(Number);
      const [hours, minutes] = formData.horaInicio.split(':').map(Number);
      
      const fechaSeleccionada = new Date(year, month - 1, day, hours, minutes, 0);
      
      console.log('🕐 Hora actual del sistema:', ahora.toString());
      console.log('🕐 Fecha seleccionada:', fechaSeleccionada.toString());
      
      // Validar que sea al menos 1 hora en el futuro
      const minimoPermitido = new Date(ahora.getTime() + 60 * 60000);
      
      if (fechaSeleccionada <= minimoPermitido) {
        alert(
          '⚠️ FECHA NO VÁLIDA\n\n' +
          'El horario debe ser al menos 1 hora en el futuro.\n\n' +
          `⏰ Hora actual: ${ahora.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}\n\n` +
          `⏰ Hora mínima: ${minimoPermitido.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}\n\n` +
          `⏰ Tu selección: ${fechaSeleccionada.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}`
        );
        setLoading(false);
        return;
      }
      
      // SOLUCIÓN: Restar 5 horas antes de enviar (el backend sumará 5h)
      const restarCincoHoras = (year, month, day, hours, minutes, duracionMinutos) => {
        let horaInicio = hours - 5;
        let diaInicio = day;
        let mesInicio = month;
        let yearInicio = year;
        
        if (horaInicio < 0) {
          horaInicio += 24;
          diaInicio -= 1;
          
          if (diaInicio < 1) {
            mesInicio -= 1;
            if (mesInicio < 1) {
              mesInicio = 12;
              yearInicio -= 1;
            }
            const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            diaInicio = diasPorMes[mesInicio - 1];
          }
        }
        
        // Calcular fecha fin
        let horaFin = horaInicio + Math.floor(duracionMinutos / 60);
        let minutosFin = minutes + (duracionMinutos % 60);
        let diaFin = diaInicio;
        
        if (minutosFin >= 60) {
          horaFin += 1;
          minutosFin -= 60;
        }
        
        if (horaFin >= 24) {
          horaFin -= 24;
          diaFin += 1;
        }
        
        return {
          fechaInicio: `${yearInicio}-${String(mesInicio).padStart(2, '0')}-${String(diaInicio).padStart(2, '0')}T${String(horaInicio).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000`,
          fechaFin: `${yearInicio}-${String(mesInicio).padStart(2, '0')}-${String(diaFin).padStart(2, '0')}T${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}:00.000`
        };
      };
      
      const { fechaInicio: fechaInicioISO, fechaFin: fechaFinISO } = restarCincoHoras(
        year, month, day, hours, minutes, formData.duracionMinutos
      );
      
      const horarioData = {
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO
      };

      console.log('📤 Usuario quiere:', `${hours}:${String(minutes).padStart(2, '0')}`);
      console.log('📤 Enviando (-5h):', horarioData);

      await horarioApi.createHorario(horarioData);
      alert('✅ Horario creado exitosamente');
      setShowForm(false);
      setFormData({ fechaInicio: '', horaInicio: '', duracionMinutos: 60 });
      await loadHorarios();
    } catch (error) {
      console.error('❌ Error al crear horario:', error);
      const errorMsg = error.response?.data || error.message;
      alert(`❌ Error al crear horario:\n\n${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorario = async (idHorario, horario) => {
    const fechaInicio = new Date(horario.fechaInicio);
    const fechaFin = new Date(horario.fechaFin);
    const ahora = new Date();
    
    // Verificar si es un horario pasado
    const esPasado = fechaFin < ahora;
    
    const tieneReservas = horario.historialReservas && 
                          horario.historialReservas.length > 0 && 
                          horario.historialReservas.some(r => 
                            r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'
                          );
    
    let mensaje = '';
    
    if (esPasado) {
      mensaje = `¿Deseas eliminar este horario pasado?\n\n` +
                `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
                `Hora: ${fechaInicio.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}\n\n` +
                `Esto ayudará a mantener tu lista limpia.`;
    } else if (tieneReservas) {
      mensaje = `⚠️ ADVERTENCIA\n\n` +
                `Este horario tiene reservas pendientes o confirmadas.\n\n` +
                `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
                `Hora: ${fechaInicio.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}\n\n` +
                `¿Estás seguro de que deseas desactivarlo?\n` +
                `Los estudiantes con reservas perderán su tutoría.`;
    } else {
      mensaje = `¿Deseas eliminar este horario?\n\n` +
                `Fecha: ${fechaInicio.toLocaleDateString('es-ES')}\n` +
                `Hora: ${fechaInicio.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} - ${fechaFin.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}\n\n` +
                `Este horario será desactivado y ya no aparecerá en tu lista.`;
    }
    
    if (!window.confirm(mensaje)) {
      return;
    }
    
    try {
      console.log('🗑️ Desactivando horario:', idHorario);
      await horarioApi.deleteHorario(idHorario);
      
      setHorarios(prevHorarios => prevHorarios.filter(h => h.id !== idHorario));
      
      alert('✅ Horario desactivado exitosamente.');
    } catch (error) {
      console.error('❌ Error al eliminar horario:', error);
      const errorMsg = error.response?.data || error.message;
      alert(`❌ Error al eliminar horario:\n\n${errorMsg}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      '⚠️ ADVERTENCIA: ELIMINACIÓN DE CUENTA\n\n' +
      '¿Estás COMPLETAMENTE SEGURO de que deseas eliminar tu cuenta?\n\n' +
      'Esta acción:\n' +
      '✖️ Desactivará tu cuenta permanentemente\n' +
      '✖️ No podrás acceder nuevamente con estas credenciales\n' +
      '✖️ Perderás acceso a todas tus tutorías y reservas\n\n' +
      'Esta acción NO SE PUEDE DESHACER.'
    )) {
      return;
    }

    const confirmacion = window.prompt(
      'Para confirmar la eliminación de tu cuenta, escribe "ELIMINAR MI CUENTA" (en mayúsculas):'
    );

    if (confirmacion !== 'ELIMINAR MI CUENTA') {
      if (confirmacion !== null) {
        alert('❌ Texto incorrecto. Eliminación cancelada.');
      }
      return;
    }

    try {
      await usuarioApi.deleteAccount();
      alert(
        '✅ Tu cuenta ha sido desactivada exitosamente.\n\n' +
        'Lamentamos verte partir. Si deseas volver en el futuro, ' +
        'contacta con soporte para reactivar tu cuenta.'
      );
      
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      alert('❌ Error al eliminar la cuenta: ' + (error.response?.data || error.message));
    }
  };

  const getEstadoColor = (disponible) => {
    return disponible ? '#4caf50' : '#ff9800';
  };

  if (loading && horarios.length === 0) {
    return <div className="loading">Cargando horarios...</div>;
  }

  // Obtener fecha y hora mínimas en hora LOCAL
  const getMinDateTime = () => {
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 60 * 60000); // 1 hora desde ahora
    
    const year = minDateTime.getFullYear();
    const month = String(minDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(minDateTime.getDate()).padStart(2, '0');
    const hours = String(minDateTime.getHours()).padStart(2, '0');
    const minutes = String(minDateTime.getMinutes()).padStart(2, '0');
    
    return {
      minDate: `${year}-${month}-${day}`,
      minTime: `${hours}:${minutes}`
    };
  };

  const { minDate, minTime } = getMinDateTime();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Gestionar Mis Horarios</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {horariosPasados.length > 0 && (
            <button 
              onClick={handleLimpiarPasados} 
              className="btn-warning"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              🗑️ Limpiar Pasados ({horariosPasados.length})
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '❌ Cancelar' : '➕ Agregar Horario'}
          </button>
        </div>
      </div>

      {/* Formulario para crear horario */}
      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>Nuevo Horario Disponible</h3>
          <form onSubmit={handleCreateHorario}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  required
                  min={minDate}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Mínimo: {new Date(minDate).toLocaleDateString('es-ES')}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Hora de Inicio *</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Debe ser al menos 1 hora en el futuro
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duración (minutos) *</label>
              <select
                className="form-control"
                value={formData.duracionMinutos}
                onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) })}
                required
              >
                <option value="30">30 minutos</option>
                <option value="60">60 minutos (1 hora)</option>
                <option value="90">90 minutos (1.5 horas)</option>
                <option value="120">120 minutos (2 horas)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-success" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              {loading ? 'Creando...' : 'Crear Horario'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de horarios */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Mis Horarios Registrados ({horarios.length})</h3>
        
        {horarios.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            No tienes horarios registrados. ¡Agrega tu primer horario disponible!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {horarios.map((horario) => {
              // Backend guarda con +5h, así que sumamos 5h al mostrar
              const fechaInicioBD = new Date(horario.fechaInicio);
              fechaInicioBD.setHours(fechaInicioBD.getHours() + 5);
              
              const fechaFinBD = new Date(horario.fechaFin);
              fechaFinBD.setHours(fechaFinBD.getHours() + 5);
              
              const fechaInicio = fechaInicioBD;
              const fechaFin = fechaFinBD;
              
              const duracion = Math.round((fechaFin - fechaInicio) / 60000);
              const ahora = new Date();
              const esPasado = fechaFin < ahora;

              return (
                <div
                  key={horario.id}
                  style={{
                    border: '1px solid #ddd',
                    borderLeft: `4px solid ${esPasado ? '#999' : getEstadoColor(horario.disponible)}`,
                    padding: '15px',
                    borderRadius: '4px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 100px',
                    gap: '15px',
                    alignItems: 'center',
                    backgroundColor: esPasado ? '#f5f5f5' : 'white',
                    opacity: esPasado ? 0.7 : 1
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '16px', color: esPasado ? '#999' : 'inherit' }}>
                      📅 {fechaInicio.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </strong>
                    <p style={{ margin: '5px 0', color: esPasado ? '#999' : '#666' }}>
                      🕐 {fechaInicio.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })} - {fechaFin.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })} ({duracion} min)
                    </p>
                    {esPasado && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#f44336' }}>
                        ⏰ Horario pasado
                      </p>
                    )}
                    {horario.historialReservas && horario.historialReservas.length > 0 && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#2196f3' }}>
                        📋 {horario.historialReservas.length} reserva(s)
                      </p>
                    )}
                  </div>

                  <div>
                    {esPasado ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: '#999',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px'
                        }}
                      >
                        PASADO
                      </span>
                    ) : (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getEstadoColor(horario.disponible),
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px'
                        }}
                      >
                        {horario.disponible ? 'DISPONIBLE' : 'RESERVADO'}
                      </span>
                    )}
                  </div>

                  <div>
                    {(horario.disponible || esPasado) && (
                      <button
                        onClick={() => handleDeleteHorario(horario.id, horario)}
                        className="btn-danger"
                        style={{ 
                          width: '100%', 
                          padding: '8px',
                          opacity: esPasado ? 0.8 : 1
                        }}
                        title={esPasado ? "Eliminar horario pasado" : "Eliminar horario"}
                      >
                        🗑️
                      </button>
                    )}
                    {!horario.disponible && !esPasado && (
                      <span style={{ 
                        display: 'block', 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: '#999' 
                      }}>
                        Reservado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zona de Peligro - Agregar al final del return, antes de cerrar </div> */}
      <div className="card" style={{ 
        marginTop: '40px', 
        border: '2px solid #f44336',
        backgroundColor: '#ffebee'
      }}>
        <h3 style={{ color: '#f44336', marginBottom: '15px' }}>
          ⚠️ Zona de Peligro
        </h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Una vez que elimines tu cuenta, no hay vuelta atrás. 
          Por favor, asegúrate de estar completamente seguro.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="btn-danger"
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🗑️ Eliminar Mi Cuenta
        </button>
      </div>
    </div>
  );
};

export default ManageSchedule;