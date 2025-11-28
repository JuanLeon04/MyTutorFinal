import React, { useState, useEffect } from 'react';
import { resenaApi } from '../../api/resenaApi';

const MyReviews = () => {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResenas();
  }, []);

  const loadResenas = async () => {
    try {
      const data = await resenaApi.getMyResenas();
      console.log('📊 Mis reseñas:', data);
      setResenas(data);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando tus reseñas...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>⭐ Mis Reseñas</h1>

      {resenas.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            Aún no has dejado ninguna reseña. Completa una tutoría para poder calificar a tu tutor.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {resenas.map((resena) => (
            <div key={resena.id} className="card">
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ marginBottom: '10px' }}>
                  👨‍🏫 {resena.tutorNombreApellido}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {'⭐'.repeat(resena.puntuacion)}
                  </span>
                  <span style={{ color: '#666' }}>
                    {resena.puntuacion}/5
                  </span>
                </div>
              </div>

              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                "{resena.comentario}"
              </p>

              <div style={{ 
                borderTop: '1px solid #eee',
                paddingTop: '15px'
              }}>
                <small style={{ color: '#999', fontSize: '12px' }}>
                  ID Tutor: {resena.idTutor}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
