import React, { useState, useEffect } from 'react';
import { resenaApi } from '../../api/resenaApi';
import { tutorApi } from '../../api/tutorApi';

const AdminReviews = () => {
  const [tutores, setTutores] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      const data = await tutorApi.listAllTutors();
      setTutores(data);
    } catch (error) {
      console.error('Error cargando tutores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResenasTutor = async (idTutor) => {
    try {
      setLoading(true);
      const data = await resenaApi.getResenasByTutor(idTutor);
      setResenas(data);
      setSelectedTutor(idTutor);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutores = tutores.filter((tutor) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const nombre = tutor.nombre && tutor.apellido 
      ? `${tutor.nombre} ${tutor.apellido}`.toLowerCase()
      : '';
    const email = tutor.correo?.toLowerCase() || '';
    const materias = tutor.materias?.map(m => m.nombre.toLowerCase()).join(' ') || '';
    
    return nombre.includes(search) || 
           email.includes(search) || 
           materias.includes(search);
  });

  if (loading && tutores.length === 0) {
    return <div className="loading">Cargando reseñas...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>⭐ Gestión de Reseñas (Admin)</h1>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Lista de tutores */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>👨‍🏫 Tutores ({tutores.length})</h2>
          
          {/* Barra de búsqueda */}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Buscar tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px',
                fontSize: '14px',
                border: '2px solid #9c27b0',
                borderRadius: '8px'
              }}
            />
            {searchTerm && (
              <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                Mostrando <strong>{filteredTutores.length}</strong> de <strong>{tutores.length}</strong>
              </p>
            )}
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredTutores.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                {searchTerm 
                  ? `No se encontraron tutores con "${searchTerm}"`
                  : 'No hay tutores registrados'}
              </p>
            ) : (
              filteredTutores.map((tutor) => (
                <div
                  key={tutor.id || tutor.idTutor}
                  onClick={() => loadResenasTutor(tutor.id || tutor.idTutor)}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    border: selectedTutor === (tutor.id || tutor.idTutor) ? '2px solid #2196f3' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedTutor === (tutor.id || tutor.idTutor) ? '#e3f2fd' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <strong>{tutor.nombre && tutor.apellido ? `${tutor.nombre} ${tutor.apellido}` : tutor.correo}</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                    {tutor.califiacionPromedio?.toFixed(1) || '0.0'} ⭐ • {tutor.materias?.length || 0} materias
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reseñas del tutor seleccionado */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>
            {selectedTutor ? `📝 Reseñas (${resenas.length})` : '📝 Selecciona un tutor'}
          </h2>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Cargando reseñas...</p>
          ) : resenas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              {selectedTutor ? 'Este tutor no tiene reseñas' : 'Selecciona un tutor para ver sus reseñas'}
            </p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {resenas.map((resena, index) => (
                <div
                  key={resena.id || resena.idResena || `resena-${index}`}
                  style={{
                    padding: '15px',
                    marginBottom: '15px',
                    borderLeft: '4px solid #4caf50',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{resena.estudianteNombre || resena.autorNombre || 'Usuario'}</strong>
                    <span style={{ fontSize: '18px' }}>
                      {'⭐'.repeat(resena.puntuacion || 0)}
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
  );
};

export default AdminReviews;
