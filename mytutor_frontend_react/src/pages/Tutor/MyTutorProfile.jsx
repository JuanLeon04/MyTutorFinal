import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorApi } from '../../api/tutorApi';

const MyTutorProfile = () => {
  const [tutor, setTutor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    precioHora: '',
    experiencia: '',
    materias: [{ nombre: '', experiencia: 0 }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const materiasDisponibles = [
    'Matemáticas',
    'Física', 
    'Química', 
    'Biología',
    'Programación',
    'Inglés',
    'Francés',
    'Alemán',
    'Historia',
    'Geografía',
    'Economía',
    'Contabilidad',
    'Cocina',
    'Repostería',
    'Música',
    'Guitarra',
    'Piano',
    'Dibujo',
    'Pintura',
    'Fotografía',
    'Diseño Gráfico',
    'Marketing',
    'Administración',
    'Derecho',
    'Medicina',
    'Enfermería',
    'Psicología',
    'Filosofía',
    'Literatura',
    'Redacción',
    'Oratoria',
    'Teatro',
    'Danza',
    'Yoga',
    'Fitness',
    'Nutrición',
    'Cálculo I',
    'Cálculo II',
    'Cálculo III',
    'Álgebra Lineal',
    'Física I',
    'Física II',
    'Física III',
    'Química Básica',
    'Biología para Ingenieros',
    'Taller de Lenguaje',
    'Cultura Física Deportiva',
    'Ética Cuadrada',
    'Matemáticas Discretas',
    'Electricidad y Electrónica',
    'Fundamentos de Programación',
    'Programación Orientada a Objetos',
    'Estructuras de Datos y Análisis de Algoritmos',
    'Sistemas Digitales',
    'Arquitectura de Computadores',
    'Dirección Empresarial',
    'Redes de Computadores',
    'Estadística I',
    'Estadística II',
    'Análisis Numérico',
    'Bases de Datos I',
    'Pensamiento Sistémico y Organizacional',
    'Automatización y Lenguajes Formales',
    'Simulación Digital',
    'Ingeniería del Software I',
    'Ingeniería del Software II',
    'Electiva I',
    'Electiva II',
    'Entornos De Programación'
  ];

  useEffect(() => {
    loadTutorProfile();
  }, []);

  const loadTutorProfile = async () => {
    try {
      const data = await tutorApi.getMyTutorProfile();
      console.log('📊 Mi perfil de tutor:', data);
      setTutor(data);
      setFormData({
        bio: data.bio || '',
        precioHora: data.precioHora || '',
        experiencia: data.experiencia || '',
        materias: data.materias && data.materias.length > 0 
          ? data.materias 
          : [{ nombre: '', experiencia: 0 }]
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error al cargar el perfil de tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMateria = () => {
    setFormData({
      ...formData,
      materias: [...formData.materias, { nombre: '', experiencia: 0 }]
    });
  };

  const handleRemoveMateria = (index) => {
    const newMaterias = formData.materias.filter((_, i) => i !== index);
    setFormData({ ...formData, materias: newMaterias });
  };

  const handleMateriaChange = (index, field, value) => {
    const newMaterias = [...formData.materias];
    newMaterias[index][field] = field === 'experiencia' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, materias: newMaterias });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        bio: formData.bio,
        precioHora: parseFloat(formData.precioHora),
        experiencia: formData.experiencia,
        materias: formData.materias.filter(m => m.nombre.trim() !== '')
      };

      console.log('📤 Actualizando perfil:', updateData);
      
      const updatedProfile = await tutorApi.updateMyTutorProfile(updateData);
      setTutor(updatedProfile);
      setEditMode(false);
      alert('✅ Perfil actualizado exitosamente');
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError(err.response?.data || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      bio: tutor.bio || '',
      precioHora: tutor.precioHora || '',
      experiencia: tutor.experiencia || '',
      materias: tutor.materias && tutor.materias.length > 0 
        ? tutor.materias 
        : [{ nombre: '', experiencia: 0 }]
    });
    setError('');
  };

  const handleDeleteProfile = async () => {
    if (window.confirm(
      '⚠️ ADVERTENCIA IMPORTANTE\n\n' +
      '¿Estás SEGURO de que deseas eliminar tu perfil de tutor?\n\n' +
      'Esto eliminará:\n' +
      '✖️ Tu perfil de tutor\n' +
      '✖️ Todos tus horarios\n' +
      '✖️ Todas tus tutorías programadas\n' +
      '✖️ Tu historial de reseñas\n\n' +
      'Esta acción NO se puede deshacer.\n\n' +
      '¿Deseas continuar?'
    )) {
      const confirmacion = window.prompt('Para confirmar, escribe "ELIMINAR" (en mayúsculas):');
      
      if (confirmacion === 'ELIMINAR') {
        try {
          await tutorApi.deleteMyTutorProfile();
          alert('✅ Perfil de tutor eliminado exitosamente\n\nTu cuenta de usuario sigue activa.');
          navigate('/dashboard');
        } catch (error) {
          console.error('Error al eliminar perfil:', error);
          alert(`❌ Error: ${error.response?.data || error.message}`);
        }
      } else if (confirmacion !== null) {
        alert('❌ Texto incorrecto. Eliminación cancelada.');
      }
    }
  };

  if (loading && !tutor) return <div className="loading">Cargando perfil...</div>;

  if (error && !tutor) {
    return (
      <div className="container">
        <div className="card">
          <p style={{ color: '#f44336', textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>👨‍🏫 Mi Perfil de Tutor</h1>

      <div className="card" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#e3f2fd' }}>
        <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
          💡 <strong>Nota:</strong> Para cambiar tu foto de perfil, ve a{' '}
          <a href="/profile" style={{ color: '#1976d2', fontWeight: 'bold' }}>Mi Perfil</a>
        </p>
      </div>

      {!editMode ? (
        // Modo Vista
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2>Información del Perfil</h2>
            <button onClick={() => setEditMode(true)} className="btn-primary">
              ✏️ Editar Perfil
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>💰 Precio por Hora</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              ${tutor?.precioHora}/hora
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>🎓 Experiencia</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{tutor?.experiencia}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>📝 Biografía</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{tutor?.bio}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>📚 Materias</h3>
            {tutor?.materias && tutor.materias.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {tutor.materias.map((materia, index) => (
                  <span
                    key={index}
                    className="badge badge-info"
                    style={{ padding: '10px 15px', fontSize: '14px' }}
                  >
                    {materia.nombre} ({materia.experiencia} años)
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>No hay materias registradas</p>
            )}
          </div>

          {/* Zona de peligro */}
          <div style={{ 
            marginTop: '40px', 
            padding: '20px', 
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '2px solid #f44336'
          }}>
            <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>⚠️ Zona de Peligro</h3>
            <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
              Eliminar tu perfil de tutor borrará permanentemente todos tus horarios, 
              tutorías programadas y tu historial como tutor. Esta acción NO se puede deshacer.
            </p>
            <button onClick={handleDeleteProfile} className="btn-danger" style={{ padding: '12px 24px', fontWeight: '600' }}>
              🗑️ Eliminar Perfil de Tutor
            </button>
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              Tu cuenta de usuario no será eliminada, solo tu perfil de tutor.
            </p>
          </div>
        </div>
      ) : (
        // Modo Edición
        <div className="card">
          <h2 style={{ marginBottom: '30px' }}>✏️ Editar Perfil de Tutor</h2>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Biografía *</label>
              <textarea
                className="form-control"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows="4"
                minLength={20}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experiencia General *</label>
              <input
                type="text"
                className="form-control"
                value={formData.experiencia}
                onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                required
                minLength={10}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio por Hora ($) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.precioHora}
                onChange={(e) => setFormData({ ...formData, precioHora: e.target.value })}
                required
                min="1"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Materias que enseñas *</label>
              {formData.materias.map((materia, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={materia.nombre}
                    onChange={(e) => handleMateriaChange(index, 'nombre', e.target.value)}
                    placeholder="Nombre de la materia"
                    required
                    list="materias-list"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={materia.experiencia}
                    onChange={(e) => handleMateriaChange(index, 'experiencia', e.target.value)}
                    placeholder="Años"
                    min="0"
                    max="50"
                    required
                  />
                  {formData.materias.length > 1 && (
                    <button type="button" onClick={() => handleRemoveMateria(index)} className="btn-danger">
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              <datalist id="materias-list">
                {materiasDisponibles.map((mat, i) => (
                  <option key={i} value={mat} />
                ))}
              </datalist>
              <button type="button" onClick={handleAddMateria} className="btn-secondary" style={{ marginTop: '10px' }}>
                ➕ Agregar Materia
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={loading} className="btn-success" style={{ flex: 1 }}>
                {loading ? 'Guardando...' : '✅ Guardar Cambios'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{ flex: 1 }}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyTutorProfile;
