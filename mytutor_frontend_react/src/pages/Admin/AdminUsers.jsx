import React, { useState, useEffect } from 'react';
import { usuarioApi } from '../../api/usuarioApi';

const AdminUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await usuarioApi.getAllUsers();
      console.log('📊 Usuarios cargados:', data);
      
      // Filtrar solo usuarios activos
      const usuariosActivos = data.filter(usuario => usuario.activo !== false);
      console.log('📊 Usuarios activos filtrados:', usuariosActivos.length);
      
      setUsuarios(usuariosActivos);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, usuario) => {
    if (window.confirm(
      `⚠️ ADVERTENCIA: ELIMINACIÓN PERMANENTE\n\n` +
      `¿Estás COMPLETAMENTE SEGURO de eliminar este usuario?\n\n` +
      `Usuario: ${usuario.nombre} ${usuario.apellido}\n` +
      `Nombre de usuario: ${usuario.nombreUsuario}\n` +
      `Rol: ${usuario.rol}\n\n` +
      `⚠️ ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE:\n` +
      `✖️ El usuario y toda su información\n` +
      `✖️ Todas sus reservas\n` +
      `✖️ Su historial completo\n\n` +
      `Esta acción NO SE PUEDE DESHACER.`
    )) {
      const confirmacion = window.prompt(
        'Para confirmar la eliminación permanente, escribe "ELIMINAR" (en mayúsculas):'
      );
      
      if (confirmacion === 'ELIMINAR') {
        try {
          console.log('🗑️ Eliminando usuario permanentemente - ID:', userId);
          await usuarioApi.deleteUserById(userId);
          alert('✅ Usuario eliminado permanentemente');
          await loadUsuarios();
        } catch (error) {
          console.error('❌ Error al eliminar usuario:', error);
          alert(`❌ Error: ${error.response?.data?.message || error.response?.data || error.message}`);
        }
      } else if (confirmacion !== null) {
        alert('❌ Texto incorrecto. Eliminación cancelada.');
      }
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const nombre = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const email = usuario.correo?.toLowerCase() || '';
    const nombreUsuario = usuario.nombreUsuario?.toLowerCase() || '';
    const rol = usuario.rol?.toLowerCase() || '';
    
    return nombre.includes(search) || 
           email.includes(search) || 
           nombreUsuario.includes(search) ||
           rol.includes(search);
  });

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>👥 Gestión de Usuarios (Admin)</h1>

      <div className="card">
        {/* Barra de búsqueda */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar por nombre, email, usuario o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #2196f3',
              borderRadius: '8px'
            }}
          />
          {searchTerm && (
            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
              Mostrando <strong>{filteredUsuarios.length}</strong> de <strong>{usuarios.length}</strong> usuarios
            </p>
          )}
        </div>

        <p style={{ marginBottom: '20px' }}>
          Total de usuarios: <strong>{usuarios.length}</strong>
        </p>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nombre Usuario</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Rol</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <small style={{ fontSize: '10px', color: '#999' }}>
                      {usuario.id?.substring(0, 8)}...
                    </small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {usuario.fotoPerfil ? (
                        <img
                          src={usuario.fotoPerfil}
                          alt={usuario.nombre}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #2196f3'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#999',
                          border: '2px solid #2196f3'
                        }}>
                          👤
                        </div>
                      )}
                      <div>
                        <strong>{usuario.nombre} {usuario.apellido}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#666' }}>@{usuario.nombreUsuario}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-info">{usuario.rol || 'ESTUDIANTE'}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${usuario.activo !== false ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleDeleteUser(usuario.id, usuario)}
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

        {filteredUsuarios.length === 0 && usuarios.length > 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No se encontraron usuarios con "{searchTerm}"
          </p>
        )}

        {usuarios.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No hay usuarios registrados
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
