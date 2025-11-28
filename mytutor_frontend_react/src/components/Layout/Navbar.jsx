import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('🔍 Navbar - Usuario:', user);
  console.log('🔍 Navbar - Rol:', role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          📚 MyTutor
        </Link>

        {user ? (
          <>
            <ul className="navbar-menu">
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">
                  🏠 Inicio
                </Link>
              </li>
              
              {role === 'ROLE_ADMIN' ? (
                // Opciones específicas para Admin
                <>
                  <li className="navbar-item">
                    <Link to="/admin/users" className="navbar-link">
                      👥 Usuarios
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/tutors" className="navbar-link">
                      👨‍🏫 Tutores
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/reservations" className="navbar-link">
                      📅 Reservas
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/reviews" className="navbar-link">
                      ⭐ Reseñas
                    </Link>
                  </li>
                </>
              ) : (
                // Opciones para usuarios normales (Estudiantes/Tutores)
                <>
                  <li className="navbar-item">
                    <Link to="/tutors" className="navbar-link">
                      🔍 Buscar Tutores
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/my-reservations" className="navbar-link">
                      📅 Mis Reservas
                    </Link>
                  </li>
                </>
              )}
              
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">
                  👤 Mi Perfil
                </Link>
              </li>
            </ul>

            <div className="navbar-user">
              <span className="navbar-username">
                {user.nombre || user.nombreUsuario}
              </span>
              <button onClick={handleLogout} className="navbar-logout">
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <ul className="navbar-menu">
            <li className="navbar-item">
              <Link to="/login" className="navbar-link">
                Iniciar Sesión
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/register" className="navbar-link">
                Registrarse
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
