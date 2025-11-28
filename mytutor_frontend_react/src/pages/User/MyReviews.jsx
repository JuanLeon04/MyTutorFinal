import React, { useState, useEffect } from 'react';
import { resenaApi } from '../../api/resenaApi';

const MyReviews = () => {
  const [resenas, setResenas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ calificacion: 5, comentario: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResenas();
  }, []);

  const loadResenas = async () => {
    try {
      const data = await resenaApi.getMyResenas();
      setResenas(data);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resena) => {
    setEditingId(resena.id);
    setEditForm({
      calificacion: resena.calificacion,
      comentario: resena.comentario
    });
  };

  const handleUpdate = async (resenaId) => {
    try {
      await resenaApi.updateResena({
        id: resenaId,
        ...editForm
      });
      alert('Reseña actualizada exitosamente');
      setEditingId(null);
      loadResenas();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar reseña');
    }
  };

  if (loading) return <div className="loading">Cargando tus reseñas...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>⭐ Mis Reseñas</h1>

      {resenas.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
            Aún no has dejado reseñas. Completa una tutoría para poder dejar tu opinión.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {resenas.map((resena) => (
            <div key={resena.id} className="card">
              {editingId === resena.id ? (
                <div>
                  <h3 style={{ marginBottom: '15px' }}>Editando reseña para {resena.tutor?.usuario?.nombre}</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Calificación</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, calificacion: star })}
                          style={{
                            fontSize: '32px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {star <= editForm.calificacion ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comentario</label>
                    <textarea
                      className="form-control"
                      value={editForm.comentario}
                      onChange={(e) => setEditForm({ ...editForm, comentario: e.target.value })}
                      rows="4"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => handleUpdate(resena.id)} className="btn-success" style={{ flex: 1 }}>
                      Guardar Cambios
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ flex: 1 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>Tutor: {resena.tutor?.usuario?.nombre}</h3>
                      <span style={{ fontSize: '20px' }}>{'⭐'.repeat(resena.calificacion)}</span>
                    </div>
                    <button onClick={() => handleEdit(resena)} className="btn-primary">
                      ✏️ Editar
                    </button>
                  </div>
                  
                  <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '10px' }}>
                    {resena.comentario}
                  </p>
                  
                  <small style={{ color: '#999' }}>
                    📅 {new Date(resena.fechaCreacion).toLocaleDateString('es-ES')}
                  </small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
