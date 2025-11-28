import React, { useState, useEffect } from 'react';
import { usuarioApi } from '../../api/usuarioApi';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { updateUser } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    nombreUsuario: '',
    fotoPerfil: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await usuarioApi.getMyProfile();
      console.log('📊 Mi perfil:', data);
      setUsuario(data);
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        nombreUsuario: data.nombreUsuario || '',
        fotoPerfil: data.fotoPerfil || ''
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        id: usuario.id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        nombreUsuario: formData.nombreUsuario,
        fotoPerfil: formData.fotoPerfil || usuario.fotoPerfil || '',
        activo: usuario.activo,
        rol: usuario.rol,
        tutor: usuario.tutor || null
      };

      console.log('📤 Actualizando perfil:', updateData);
      
      const updatedProfile = await usuarioApi.updateMyProfile(updateData);
      setUsuario(updatedProfile);
      setEditMode(false);
      updateUser(updatedProfile);
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
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      nombreUsuario: usuario.nombreUsuario || '',
      fotoPerfil: usuario.fotoPerfil || ''
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Por favor selecciona una imagen válida (JPG, PNG, GIF)');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ La imagen es muy grande. Tamaño máximo: 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Crear preview y convertir a Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreviewUrl(base64String);
        setFormData({ ...formData, fotoPerfil: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({ ...formData, fotoPerfil: usuario.fotoPerfil || '' });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      '⚠️ ADVERTENCIA: ELIMINACIÓN DE CUENTA\n\n' +
      '¿Estás COMPLETAMENTE SEGURO de que deseas eliminar tu cuenta?\n\n' +
      'Esta acción:\n' +
      '✖️ Desactivará tu cuenta permanentemente\n' +
      '✖️ No podrás acceder nuevamente con estas credenciales\n' +
      '✖️ Perderás acceso a todas tus tutorías y reservas\n\n' +
      'Esta acción NO SE PUEDE DESHACER.'
    )) {
      return;
    }

    const confirmacion = window.prompt(
      'Para confirmar la eliminación de tu cuenta, escribe "ELIMINAR MI CUENTA" (en mayúsculas):'
    );

    if (confirmacion !== 'ELIMINAR MI CUENTA') {
      if (confirmacion !== null) {
        alert('❌ Texto incorrecto. Eliminación cancelada.');
      }
      return;
    }

    try {
      await usuarioApi.deleteAccount();
      alert(
        '✅ Tu cuenta ha sido desactivada exitosamente.\n\n' +
        'Lamentamos verte partir. Si deseas volver en el futuro, ' +
        'contacta con soporte para reactivar tu cuenta.'
      );
      
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      alert('❌ Error al eliminar la cuenta: ' + (error.response?.data || error.message));
    }
  };

  if (loading && !usuario) return <div className="loading">Cargando perfil...</div>;

  if (error && !usuario) {
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
      <h1 style={{ marginBottom: '30px' }}>👤 Mi Perfil</h1>

      {!editMode ? (
        // Modo Vista
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2>Información Personal</h2>
            <button onClick={() => setEditMode(true)} className="btn-primary">
              ✏️ Editar Perfil
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {usuario?.fotoPerfil ? (
                <img
                  src={usuario.fotoPerfil}
                  alt="Foto de perfil"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #2196f3'
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
                  color: '#999'
                }}>
                  👤
                </div>
              )}

              <div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#2c3e50' }}>
                  {usuario?.nombre} {usuario?.apellido}
                </h2>
                <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
                  @{usuario?.nombreUsuario}
                </p>
                <span 
                  className="badge badge-info" 
                  style={{ 
                    marginTop: '10px', 
                    display: 'inline-block',
                    padding: '6px 12px',
                    fontSize: '14px'
                  }}
                >
                  {usuario?.rol}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#2196f3', fontSize: '16px', marginBottom: '5px' }}>
                  📧 Correo Electrónico
                </h3>
                <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                  {usuario?.correo}
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#2196f3', fontSize: '16px', marginBottom: '5px' }}>
                  📱 Teléfono
                </h3>
                <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                  {usuario?.telefono || 'No registrado'}
                </p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#2196f3', fontSize: '16px', marginBottom: '5px' }}>
                  👤 Nombre de Usuario
                </h3>
                <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
                  {usuario?.nombreUsuario}
                </p>
              </div>

              <div>
                <h3 style={{ color: '#2196f3', fontSize: '16px', marginBottom: '5px' }}>
                  📋 Estado de la Cuenta
                </h3>
                <span 
                  className={`badge ${usuario?.activo ? 'badge-success' : 'badge-danger'}`}
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  {usuario?.activo ? '✅ Activa' : '❌ Inactiva'}
                </span>
              </div>
            </div>

            {usuario?.tutor && (
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                border: '2px solid #4caf50'
              }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>
                  👨‍🏫 Información de Tutor
                </h3>
                <p style={{ color: '#666', margin: '5px 0' }}>
                  <strong>Precio por Hora:</strong> ${usuario.tutor.precioHora}
                </p>
                <p style={{ color: '#666', margin: '5px 0' }}>
                  <strong>Calificación Promedio:</strong> {usuario.tutor.califiacionPromedio || 0} ⭐
                </p>
                <p style={{ color: '#666', margin: '5px 0' }}>
                  <strong>Materias:</strong> {usuario.tutor.materias?.length || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Modo Edición
        <div className="card">
          <h2 style={{ marginBottom: '30px' }}>✏️ Editar Perfil</h2>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Foto de Perfil</label>
              
              {/* Vista previa de la foto */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                {previewUrl || formData.fotoPerfil ? (
                  <img
                    src={previewUrl || formData.fotoPerfil}
                    alt="Foto de perfil"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #2196f3'
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
                    border: '3px solid #2196f3'
                  }}>
                    👤
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  {/* Input oculto para seleccionar archivo */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="foto-perfil-input"
                  />
                  <label 
                    htmlFor="foto-perfil-input" 
                    className="btn-primary"
                    style={{ 
                      display: 'inline-block', 
                      padding: '10px 20px', 
                      cursor: 'pointer',
                      marginBottom: '10px'
                    }}
                  >
                    📷 Seleccionar Foto
                  </label>
                  
                  {(selectedFile || (formData.fotoPerfil && formData.fotoPerfil !== usuario.fotoPerfil)) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="btn-secondary"
                      style={{ marginLeft: '10px', padding: '10px 20px' }}
                    >
                      🗑️ Quitar Foto
                    </button>
                  )}
                  
                  <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
                    Formatos: JPG, PNG, GIF • Tamaño máx: 5MB
                  </p>
                </div>
              </div>
              
              {/* Separador */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                <span style={{ padding: '0 10px', color: '#999', fontSize: '14px' }}>O</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
              </div>
              
              {/* Input para URL */}
              <div>
                <label className="form-label">O ingresa una URL de imagen</label>
                <input
                  type="url"
                  className="form-control"
                  value={!selectedFile ? formData.fotoPerfil : ''}
                  onChange={(e) => {
                    setFormData({ ...formData, fotoPerfil: e.target.value });
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  disabled={!!selectedFile}
                />
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {selectedFile ? 'Tienes un archivo seleccionado. Quítalo para usar URL.' : 'Ingresa la URL de tu foto de perfil (opcional)'}
                </small>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  minLength={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellido *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                className="form-control"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de Usuario *</label>
              <input
                type="text"
                className="form-control"
                value={formData.nombreUsuario}
                onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
                required
                minLength={3}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Este es el nombre con el que inicias sesión
              </small>
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

      {/* Zona de Peligro - Agregar después del último </div> del card de edición/vista */}
      <div className="card" style={{ 
        marginTop: '40px', 
        border: '2px solid #f44336',
        backgroundColor: '#ffebee'
      }}>
        <h3 style={{ color: '#f44336', marginBottom: '15px' }}>
          ⚠️ Zona de Peligro
        </h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Una vez que elimines tu cuenta, no hay vuelta atrás. 
          Por favor, asegúrate de estar completamente seguro.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="btn-danger"
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🗑️ Eliminar Mi Cuenta
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
