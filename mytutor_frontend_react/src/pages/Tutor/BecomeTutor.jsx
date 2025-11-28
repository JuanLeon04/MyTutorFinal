import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorApi } from '../../api/tutorApi';

const BecomeTutor = () => {
  const [formData, setFormData] = useState({
    bio: '',
    experiencia: '',
    materias: [{ nombre: '', experiencia: 0 }],
    precioHora: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tutorData = {
        bio: formData.bio,
        experiencia: formData.experiencia,
        precioHora: parseFloat(formData.precioHora),
        materias: formData.materias.filter(m => m.nombre.trim() !== '')
      };
      
      console.log('📤 Enviando datos de tutor:', tutorData);
      
      await tutorApi.becomeTutor(tutorData);
      alert('¡Te has convertido en tutor exitosamente!');
      navigate('/my-tutor-profile');
    } catch (err) {
      console.error('❌ Error al convertirse en tutor:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Error al convertirse en tutor';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px' }}>✨ Convertirse en Tutor</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Biografía *</label>
            <textarea
              className="form-control"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows="4"
              placeholder="Cuéntanos sobre ti, tu formación y experiencia..."
              minLength={20}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Mínimo 20 caracteres
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Experiencia General *</label>
            <input
              type="text"
              className="form-control"
              value={formData.experiencia}
              onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
              required
              placeholder="Ej: 5 años enseñando a nivel universitario"
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
              placeholder="Ej: 15.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Materias que enseñas *</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '10px', fontSize: '12px' }}>
              Agrega las materias que enseñas con tu experiencia en años
            </small>
            
            {formData.materias.map((materia, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr auto', 
                gap: '10px', 
                marginBottom: '10px',
                alignItems: 'end'
              }}>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={materia.nombre}
                    onChange={(e) => handleMateriaChange(index, 'nombre', e.target.value)}
                    placeholder="Nombre de la materia"
                    required
                    list="materias-list"
                  />
                </div>
                
                <div>
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
                </div>
                
                <div>
                  {formData.materias.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMateria(index)}
                      className="btn-danger"
                      style={{ padding: '10px 15px' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}

            <datalist id="materias-list">
              {materiasDisponibles.map((mat, i) => (
                <option key={i} value={mat} />
              ))}
            </datalist>

            <button
              type="button"
              onClick={handleAddMateria}
              className="btn-secondary"
              style={{ marginTop: '10px', padding: '8px 16px' }}
            >
              ➕ Agregar otra materia
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" disabled={loading} className="btn-success" style={{ flex: 1, padding: '12px' }}>
              {loading ? 'Guardando...' : '✨ Convertirse en Tutor'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeTutor;
