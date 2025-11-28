import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    nombreUsuario: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('✅ Usuario detectado en Login:', user.nombre);
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Intentando login con nombreUsuario:', credentials.nombreUsuario);
      await login(credentials);
      
      setTimeout(() => {
        console.log('🚀 Redirigiendo a dashboard');
        navigate('/dashboard', { replace: true });
      }, 300);
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.response?.data || 'Credenciales incorrectas');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📚</h1>
          <h2 style={{ margin: '0 0 5px 0' }}>MyTutor</h2>
          <p style={{ color: '#666', margin: 0 }}>Iniciar Sesión</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario *</label>
            <input
              type="text"
              className="form-control"
              value={credentials.nombreUsuario}
              onChange={(e) => setCredentials({ ...credentials, nombreUsuario: e.target.value })}
              required
              placeholder="tu_usuario"
              autoComplete="username"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Usa tu nombre de usuario, no tu correo electrónico
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              className="form-control"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#2196f3', fontWeight: 'bold' }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
