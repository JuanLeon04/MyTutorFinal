import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/authApi'; // Asegúrate de importar tu instancia de API

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    correo: '',
    password: '',
    telefono: '',
    fotoPerfil: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

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
    setFormData({ ...formData, fotoPerfil: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono || '',
        fotoPerfil: formData.fotoPerfil || '',
        nombreUsuario: formData.nombreUsuario,
        password: formData.password
      };

      console.log('📤 Registrando usuario:', { ...registerData, password: '***', fotoPerfil: registerData.fotoPerfil ? 'Base64 presente' : 'Sin foto' });
      
      await authApi.register(registerData);
      
      alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      console.error('❌ Error en registro:', err);
      console.error('❌ Detalles:', err.response?.data);
      setError(err.response?.data || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📚</h1>
          <h2 style={{ margin: '0 0 5px 0' }}>MyTutor</h2>
          <p style={{ color: '#666', margin: 0 }}>Crear Cuenta Nueva</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Foto de Perfil (Opcional)</label>
            
            {/* Vista previa de la foto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              {previewUrl || formData.fotoPerfil ? (
                <img
                  src={previewUrl || formData.fotoPerfil}
                  alt="Foto de perfil"
                  style={{
                    width: '80px',
                    height: '80px',
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
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: '#999',
                  border: '2px solid #2196f3'
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
                  id="registro-foto-input"
                />
                <label 
                  htmlFor="registro-foto-input" 
                  className="btn-secondary"
                  style={{ 
                    display: 'inline-block', 
                    padding: '8px 16px', 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📷 Seleccionar Foto
                </label>
                
                {(selectedFile || formData.fotoPerfil) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-secondary"
                    style={{ marginLeft: '8px', padding: '8px 16px', fontSize: '14px' }}
                  >
                    🗑️
                  </button>
                )}
                
                <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 0 0' }}>
                  JPG, PNG, GIF • Máx: 5MB
                </p>
              </div>
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
            <label className="form-label">Nombre de Usuario *</label>
            <input
              type="text"
              className="form-control"
              value={formData.nombreUsuario}
              onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
              required
              placeholder="juanperez123"
              minLength={4}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Este será tu nombre único en el sistema
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <input
              type="email"
              className="form-control"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono *</label>
            <input
              type="tel"
              className="form-control"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              placeholder="+57 300 123 4567"
              minLength={10}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña *</label>
            <input
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Repite tu contraseña"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-success" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#2196f3', fontWeight: 'bold' }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
