import React, { useState, useEffect } from 'react';
import { tutorApi } from '../../api/tutorApi';

const AdminTutors = () => {
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      const data = await tutorApi.listAllTutors();
      console.log('📊 Tutores cargados:', data);
      console.log('📊 Estructura del primer tutor:', JSON.stringify(data[0], null, 2));
      console.log('📊 Estado activo del primer tutor:', data[0]?.activo);
      setTutores(data);
    } catch (error) {
      console.error('Error cargando tutores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutor = async (tutorId, tutor) => {
    const tutorNombre = tutor.nombre && tutor.apellido 
      ? `${tutor.nombre} ${tutor.apellido}`
      : tutor.correo || 'Tutor';
      
    if (window.confirm(
      `⚠️ ADVERTENCIA: ELIMINACIÓN PERMANENTE\n\n` +
      `¿Estás COMPLETAMENTE SEGURO de eliminar este tutor?\n\n` +
      `Tutor: ${tutorNombre}\n` +
      `Email: ${tutor.correo}\n` +
      `Materias: ${tutor.materias?.length || 0}\n` +
      `Precio: $${tutor.precioHora}/hora\n\n` +
      `⚠️ ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE:\n` +
      `✖️ El perfil del tutor\n` +
      `✖️ Todos sus horarios\n` +
      `✖️ Todas sus tutorías\n` +
      `✖️ Su historial completo\n\n` +
      `Esta acción NO SE PUEDE DESHACER.`
    )) {
      const confirmacion = window.prompt(
        'Para confirmar la eliminación permanente, escribe "ELIMINAR" (en mayúsculas):'
      );
      
      if (confirmacion === 'ELIMINAR') {
        try {
          console.log('🗑️ Eliminando tutor permanentemente - ID:', tutorId);
          await tutorApi.deleteTutorById(tutorId);
          alert('✅ Tutor eliminado permanentemente');
          await loadTutores();
        } catch (error) {
          console.error('❌ Error al eliminar tutor:', error);
          alert(`❌ Error: ${error.response?.data?.message || error.response?.data || error.message}`);
        }
      } else if (confirmacion !== null) {
        alert('❌ Texto incorrecto. Eliminación cancelada.');
      }
    }
  };

  const filteredTutores = tutores.filter((tutor) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const nombre = `${tutor.nombre} ${tutor.apellido}`.toLowerCase();
    const email = tutor.correo?.toLowerCase() || '';
    const materias = tutor.materias?.map(m => m.nombre.toLowerCase()).join(' ') || '';
    
    return nombre.includes(search) || 
           email.includes(search) || 
           materias.includes(search);
  });

  if (loading) return <div className="loading">Cargando tutores...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>👨‍🏫 Gestión de Tutores (Admin)</h1>

      <div className="card">
        {/* Barra de búsqueda */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar por nombre, email o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #4caf50',
              borderRadius: '8px'
            }}
          />
          {searchTerm && (
            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
              Mostrando <strong>{filteredTutores.length}</strong> de <strong>{tutores.length}</strong> tutores
            </p>
          )}
        </div>

        <p style={{ marginBottom: '20px' }}>
          Total de tutores: <strong>{tutores.length}</strong>
        </p>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Tutor</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Calificación</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Precio/hora</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Materias</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTutores.map((tutor) => (
                <tr key={tutor.idTutor || tutor.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <small style={{ fontSize: '10px', color: '#999' }}>
                      {(tutor.idTutor || tutor.id)?.substring(0, 8)}...
                    </small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <strong>{tutor.nombre} {tutor.apellido}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{tutor.correo}</small>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {'⭐'.repeat(Math.round(tutor.califiacionPromedio || 0))}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                      ({(tutor.califiacionPromedio || 0).toFixed(1)})
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong style={{ color: '#4caf50' }}>
                      ${tutor.precioHora}/hora
                    </strong>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {tutor.materias && tutor.materias.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {tutor.materias.slice(0, 2).map((materia, index) => (
                          <span 
                            key={index}
                            className="badge badge-info"
                            style={{ fontSize: '11px' }}
                          >
                            {materia.nombre}
                          </span>
                        ))}
                        {tutor.materias.length > 2 && (
                          <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                            +{tutor.materias.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>Sin materias</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${tutor.activo !== false ? 'badge-success' : 'badge-danger'}`}>
                      {tutor.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleDeleteTutor(tutor.idTutor || tutor.id, tutor)}
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTutores.length === 0 && tutores.length > 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No se encontraron tutores con "{searchTerm}"
          </p>
        )}

        {tutores.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No hay tutores registrados
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminTutors;
