import React, { useState, useEffect } from 'react';
import { horarioApi } from '../../api/horarioApi';

const MySchedule = () => {
  const [horarios, setHorarios] = useState([]);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      const data = await horarioApi.getMyHorarios();
      console.log('🔍 HORARIOS RECIBIDOS DEL BACKEND:');
      data.forEach((h, i) => {
        console.log(`  Horario ${i + 1}:`);
        console.log(`    fechaInicio: "${h.fechaInicio}"`);
        console.log(`    fechaFin: "${h.fechaFin}"`);
      });
      // Forzar nueva referencia del array para que React re-renderice
      setHorarios([...data]);
    } catch (error) {
      console.error('Error cargando horarios:', error);
    }
  };

  const handleCreateHorario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (horaFin <= horaInicio) {
        setError('La hora de fin debe ser posterior a la hora de inicio');
        setLoading(false);
        return;
      }

      // Crear fecha/hora en formato ISO sin ajuste de zona horaria
      const fechaInicioISO = `${fecha}T${horaInicio}:00`;
      const fechaFinISO = `${fecha}T${horaFin}:00`;

      const horarioData = {
        fechaInicio: fechaInicioISO,
        fechaFin: fechaFinISO
      };

      console.log('📤 Enviando horario:', fechaInicioISO, '-', fechaFinISO);

      await horarioApi.createHorario(horarioData);
      alert('✅ Horario creado exitosamente');
      
      setFecha('');
      setHoraInicio('');
      setHoraFin('');
      
      await loadHorarios();
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.response?.data || err.message || 'Error al crear horario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorario = async (horarioId) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      try {
        await horarioApi.deleteHorario(horarioId);
        alert('✅ Horario eliminado');
        await loadHorarios();
      } catch (error) {
        console.error('Error eliminando horario:', error);
        alert('❌ Error: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>📅 Gestionar Horarios</h1>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>➕ Crear Nuevo Horario</h2>
        
        <form onSubmit={handleCreateHorario}>
          <div className="form-group">
            <label className="form-label">Fecha *</label>
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hora de Inicio *</label>
              <input
                type="time"
                className="form-control"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hora de Fin *</label>
              <input
                type="time"
                className="form-control"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            {loading ? 'Creando...' : '➕ Crear Horario'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>📋 Mis Horarios</h2>
        
        {horarios.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No tienes horarios creados
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {horarios.map((horario) => {
              console.log('🎨 RENDERIZANDO:', horario.fechaInicio);
              
              // Backend guarda con +5h, así que restamos 5h al mostrar
              const ajustarHoraParaMostrar = (fechaHoraISO) => {
                const [fechaParte, horaParte] = fechaHoraISO.split('T');
                const [year, month, day] = fechaParte.split('-');
                const [hour, minute] = horaParte.split(':');
                
                let horaAjustada = parseInt(hour) - 5;
                let diaAjustado = parseInt(day);
                let mesAjustado = parseInt(month);
                
                console.log(`  Hora del backend: ${hour}:${minute}`);
                console.log(`  Restando 5h: ${horaAjustada}:${minute}`);
                
                if (horaAjustada < 0) {
                  horaAjustada += 24;
                  diaAjustado -= 1;
                  if (diaAjustado < 1) {
                    mesAjustado -= 1;
                    if (mesAjustado < 1) {
                      mesAjustado = 12;
                    }
                    diaAjustado = 30; // Simplificado
                  }
                }
                
                return {
                  fecha: `${String(diaAjustado).padStart(2, '0')}/${String(mesAjustado).padStart(2, '0')}/${year}`,
                  hora: `${String(horaAjustada).padStart(2, '0')}:${minute}`
                };
              };
              
              const inicio = ajustarHoraParaMostrar(horario.fechaInicio);
              const fin = ajustarHoraParaMostrar(horario.fechaFin);
              
              console.log(`  Mostrando: ${inicio.hora} - ${fin.hora}`);
              
              return (
                <div key={horario.id} className="card" style={{ backgroundColor: '#f9f9f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                        📅 {inicio.fecha}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        🕐 {inicio.hora} - {fin.hora}
                      </p>
                      <span className={`badge ${horario.disponible ? 'badge-success' : 'badge-danger'}`}>
                        {horario.disponible ? 'Disponible' : 'Reservado'}
                      </span>
                    </div>
                    {horario.disponible && (
                      <button
                        onClick={() => handleDeleteHorario(horario.id)}
                        className="btn-danger"
                        style={{ padding: '8px 16px' }}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedule;
