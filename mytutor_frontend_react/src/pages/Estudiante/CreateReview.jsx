import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { resenaApi } from '../../api/resenaApi';
import { tutorApi } from '../../api/tutorApi';

const CreateReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { horarioId, tutorId, tutorNombre } = location.state || {};

  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('📍 CreateReview - State recibido:', location.state);
    console.log('  - horarioId:', horarioId);
    console.log('  - tutorId:', tutorId);
    console.log('  - tutorNombre:', tutorNombre);
    
    // Verificar que vengan los datos necesarios
    if (!horarioId || !tutorId) {
      console.error('❌ Faltan datos requeridos');
      alert('❌ Error: Datos de reserva no encontrados');
      navigate('/my-reservations');
    }
  }, [horarioId, tutorId, location.state, navigate]);

  if (!horarioId || !tutorId) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      setError('Por favor selecciona una calificación entre 1 y 5 estrellas');
      setLoading(false);
      return;
    }

    if (!comentario || comentario.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      setLoading(false);
      return;
    }

    try {
      const resenaData = {
        idHorario: horarioId,
        puntuacion: parseInt(calificacion),
        comentario: comentario.trim()
      };

      console.log('📤 Enviando reseña:', resenaData);
      console.log('📤 ID Horario:', horarioId);
      console.log('📤 Puntuación:', calificacion);
      console.log('📤 Comentario:', comentario);
      
      const response = await resenaApi.createResena(resenaData);
      console.log('✅ Reseña creada:', response);
      
      alert('✅ ¡Reseña enviada exitosamente! Gracias por tu opinión.');
      navigate('/my-reservations');
    } catch (err) {
      console.error('❌ Error al enviar reseña:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      
      // Verificar si el error es porque ya existe una reseña
      if (typeof errorMsg === 'string' && (
        errorMsg.includes('ya existe') || 
        errorMsg.includes('already exists') || 
        errorMsg.includes('duplicada') ||
        errorMsg.includes('Ya has dejado')
      )) {
        setError('Ya has dejado una reseña para esta tutoría. No puedes enviar otra reseña para la misma reserva.');
        alert('⚠️ Ya has dejado una reseña para esta tutoría.');
        setTimeout(() => navigate('/my-reservations'), 2000);
      } else if (err.response?.status === 400) {
        setError('Datos inválidos. Verifica que la tutoría esté completada y no hayas hecho una reseña antes.');
      } else if (err.response?.status === 403) {
        setError('No tienes permiso para crear esta reseña. Solo puedes reseñar tutorías completadas.');
      } else if (err.response?.status === 404) {
        setError('No se encontró la tutoría. Es posible que haya sido eliminada.');
      } else {
        setError('Error al enviar la reseña: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px' }}>⭐ Calificar Tutoría</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Calificación *</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCalificacion(star)}
                  style={{
                    fontSize: '40px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {star <= calificacion ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {calificacion === 5 && '¡Excelente! 😊'}
              {calificacion === 4 && 'Muy bueno 👍'}
              {calificacion === 3 && 'Bueno 😊'}
              {calificacion === 2 && 'Regular 😐'}
              {calificacion === 1 && 'Necesita mejorar 😕'}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Comentario *</label>
            <textarea
              className="form-control"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              required
              rows="5"
              placeholder="Comparte tu experiencia con este tutor..."
              minLength={10}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Mínimo 10 caracteres
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"  
              disabled={loading}  
              className="btn-success" 
              style={{ flex: 1, padding: '12px' }}
            >
              {loading ? 'Enviando...' : '✅ Enviar Reseña'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-reservations')}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Cancelar
            </button>
          </div>
        </form>
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
            💡 <strong>Tu opinión es importante</strong><br/>
            Ayuda a otros estudiantes compartiendo tu experiencia con este tutor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;
