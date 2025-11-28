import React, { useState } from 'react';
import { tutorApi } from '../../api/tutorApi';

const BecomeTutorModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    bio: '',
    experiencia: '',
    materias: '',
    precioPorHora: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await tutorApi.becomeTutor({
        ...formData,
        materias: formData.materias.split(',').map((m) => m.trim()),
        precioPorHora: parseFloat(formData.precioPorHora),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al convertirse en tutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2>Convertirse en Tutor</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Biografía:</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows="4"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Experiencia:</label>
            <input
              type="text"
              value={formData.experiencia}
              onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
              placeholder="Ej: 5 años enseñando matemáticas"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Materias (separadas por coma):</label>
            <input
              type="text"
              value={formData.materias}
              onChange={(e) => setFormData({ ...formData, materias: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
              placeholder="Matemáticas, Física, Química"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Precio por Hora ($):</label>
            <input
              type="number"
              value={formData.precioPorHora}
              onChange={(e) => setFormData({ ...formData, precioPorHora: e.target.value })}
              required
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px' }}>
              {loading ? 'Guardando...' : 'Convertirse en Tutor'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeTutorModal;
