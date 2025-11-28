import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tutorApi } from '../../api/tutorApi';
import { horarioApi } from '../../api/horarioApi';
import { resenaApi } from '../../api/resenaApi';
import { reservaApi } from '../../api/reservaApi';

// Helper para ajustar fechas del backend (restar 5 horas)
const ajustarFechaBackend = (fechaISO) => {
  const fecha = new Date(fechaISO);
  fecha.setHours(fecha.getHours() - 5);
  return fecha;
};

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);

  useEffect(() => {
    console.log('📍 TutorProfile - ID del tutor:', id);
    loadTutorData();
  }, [id]);

  const loadTutorData = async () => {
    try {
      setError(null);
      console.log('📡 Cargando datos del tutor ID:', id);
      
      const tutorData = await tutorApi.getTutorById(id);
      console.log('✅ Tutor cargado:', tutorData);
      console.log('✅ Calificación promedio:', tutorData.califiacionPromedio || tutorData.calificacionPromedio);
      setTutor(tutorData);
      
      try {
        console.log('📡 Cargando horarios disponibles...');
        const horariosData = await horarioApi.getAvailableHorarios();
        
        const horariosValidos = horariosData.filter(h => h !== null && h !== undefined && h.id);
        
        const horariosTutor = horariosValidos.filter(h => {
          const tutorIdDelHorario = h.idTutor || h.tutor?.idTutor || h.tutor?.id;
          return tutorIdDelHorario === id;
        });
        
        console.log('✅ Horarios filtrados:', horariosTutor.length);
        setHorarios(horariosTutor);
      } catch (horarioError) {
        console.error('❌ Error cargando horarios:', horarioError);
        setHorarios([]);
      }
      
      try {
        console.log('📡 Cargando reseñas del tutor ID:', id);
        const resenasData = await resenaApi.getResenasByTutor(id);
        console.log('✅ Reseñas cargadas:', resenasData.length);
        console.log('✅ Datos de reseñas:', JSON.stringify(resenasData, null, 2));
        setResenas(resenasData);
      } catch (resenaError) {
        console.error('❌ Error cargando reseñas:', resenaError);
        setResenas([]);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos del tutor:', error);
      setError(error.response?.data || 'Error al cargar el perfil del tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async (idHorario) => {
    const horarioSeleccionado = horarios.find(h => h.id === idHorario);
    
    if (!horarioSeleccionado) {
      alert('❌ Error: Horario no encontrado');
      return;
    }
    
    const fechaInicio = ajustarFechaBackend(horarioSeleccionado.fechaInicio);
    const ahora = new Date();
    const horasRestantes = (fechaInicio - ahora) / (1000 * 60 * 60);
    
    if (window.confirm(
      `¿Confirmas que deseas reservar este horario?\n\n` +
      `📅 ${fechaInicio.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })}\n` +
      `🕐 ${fechaInicio.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`
    )) {
      try {
        await reservaApi.createReserva(idHorario);
        alert('✅ ¡Reserva realizada exitosamente! 🎉');
        loadTutorData();
      } catch (error) {
        console.error('❌ Error al reservar:', error);
        const errorMsg = error.response?.data?.message || error.response?.data || 'Error al realizar la reserva';
        alert(`❌ Error:\n\n${errorMsg}\n\n💡 Intenta reservar horarios con más anticipación (recomendado: al menos 3-4 horas antes).`);
      }
    }
  };

  if (loading) return <div className="loading">Cargando perfil del tutor...</div>;
  
  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: '#f44336', marginBottom: '20px' }}>❌ Error</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => navigate('/tutors')} className="btn-primary">
            ← Volver a la búsqueda
          </button>
        </div>
      </div>
    );
  }
  
  if (!tutor) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Tutor no encontrado</h2>
          <button onClick={() => navigate('/tutors')} className="btn-primary">
            ← Volver a la búsqueda
          </button>
        </div>
      </div>
    );
  }

  // Obtener el nombre del tutor de diferentes formas posibles
  const nombreCompleto = `${tutor.nombre || ''} ${tutor.apellido || ''}`.trim() || 'Tutor';

  return (
    <div className="container">
      <button onClick={() => navigate('/tutors')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        ← Volver a la búsqueda
      </button>

      <div className="container">
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {(tutor.usuario?.fotoPerfil || tutor.fotoPerfil) ? (
              <img
                src={tutor.usuario?.fotoPerfil || tutor.fotoPerfil}
                alt={`Foto de ${tutor.usuario?.nombre || tutor.nombre}`}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #4caf50'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#999',
                border: '4px solid #4caf50'
              }}>
                👤
              </div>
            )}
            <div>
              <h1 style={{ marginBottom: '10px' }}>
                {tutor.usuario?.nombre && tutor.usuario?.apellido 
                  ? `${tutor.usuario.nombre} ${tutor.usuario.apellido}`
                  : tutor.nombre || 'Tutor'}
              </h1>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50', margin: '10px 0' }}>
                ${tutor.precioHora}/hora
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>
                {'⭐'.repeat(Math.round(tutor.califiacionPromedio || tutor.calificacionPromedio || 0))}
              </span>
              <span style={{ fontSize: '18px', color: '#666' }}>
                {(tutor.califiacionPromedio || tutor.calificacionPromedio || 0).toFixed(1)} ({resenas.length} reseñas)
              </span>
            </div>

            <div style={{ marginTop: '15px' }}>
              <button className="btn-primary" style={{ padding: '10px 20px' }}>
                Contactar
              </button>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div className="card">
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Información</h3>
                <p><strong>💰 Precio:</strong> ${tutor.precioHora}/hora</p>
                <p><strong>📧 Email:</strong> {tutor.correo}</p>
                <p><strong>📱 Teléfono:</strong> {tutor.telefono}</p>
                <p><strong>🎓 Experiencia:</strong> {tutor.experiencia}</p>
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>📚 Materias que enseña</h3>
                {tutor.materias && tutor.materias.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tutor.materias.map((materia, index) => {
                      const nombreMateria = typeof materia === 'object' ? materia.nombre : materia;
                      const experienciaMateria = typeof materia === 'object' ? materia.experiencia : null;
                      
                      return (
                        <span
                          key={index}
                          className="badge badge-info"
                          style={{ padding: '8px 12px', fontSize: '14px' }}
                          title={experienciaMateria ? `${experienciaMateria} años de experiencia` : ''}
                        >
                          {nombreMateria}
                          {experienciaMateria && (
                            <small style={{ marginLeft: '5px', opacity: 0.8 }}>
                              ({experienciaMateria}a)
                            </small>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>No hay materias registradas</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>📝 Biografía</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{tutor.bio || 'Sin biografía'}</p>
              </div>
            </div>
          </div>

          {/* Horarios y Reseñas */}
          <div>
            <h3>Horarios Disponibles</h3>
            <div className="card" style={{ marginBottom: '20px' }}>
              {horarios.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Este tutor no tiene horarios disponibles en este momento
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {horarios.map((horario) => {
                    const fechaInicio = ajustarFechaBackend(horario.fechaInicio);
                    const fechaFin = ajustarFechaBackend(horario.fechaFin);
                    const duracion = Math.round((fechaFin - fechaInicio) / 60000);

                    return (
                      <div
                        key={horario.id}
                        style={{
                          border: '1px solid #ddd',
                          padding: '15px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>
                            📅 {fechaInicio.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </strong>
                          <span style={{ color: '#666' }}>
                            🕐 {fechaInicio.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {fechaFin.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <br />
                          <small style={{ color: '#999' }}>⏱️ Duración: {duracion} minutos</small>
                          <br />
                          <small style={{ color: '#4caf50', fontWeight: 'bold' }}>
                            💰 ${horario.precioHora || tutor.precioHora}
                          </small>
                        </div>
                        <button
                          onClick={() => handleReservar(horario.id)}
                          className="btn-success"
                          style={{ padding: '10px 20px' }}
                        >
                          Reservar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <h3 style={{ marginTop: '30px' }}>💬 Reseñas ({resenas.length})</h3>
            <div className="card">
              {resenas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Este tutor aún no tiene reseñas
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                  {resenas.map((resena, index) => (
                    <div
                      key={resena.id || index}
                      style={{
                        borderLeft: '3px solid #4caf50',
                        paddingLeft: '15px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '16px' }}>
                          {resena.estudianteNombre || resena.autorNombre || 'Estudiante'}
                        </strong>
                        <span style={{ fontSize: '18px' }}>
                          {'⭐'.repeat(resena.puntuacion || resena.calificacion || 0)}
                        </span>
                      </div>
                      <p style={{ color: '#666', margin: '5px 0', lineHeight: '1.5' }}>
                        {resena.comentario}
                      </p>
                      {resena.fecha && (
                        <small style={{ color: '#999' }}>
                          {new Date(resena.fecha).toLocaleDateString('es-ES')}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
