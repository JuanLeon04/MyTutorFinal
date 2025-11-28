import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Student pages
import SearchTutors from './pages/Estudiante/SearchTutors';
import TutorProfile from './pages/Estudiante/TutorProfile';
import MyReservations from './pages/Estudiante/MyReservations';
import CreateReview from './pages/Estudiante/CreateReview';
import MyReviews from './pages/Estudiante/MyReviews'; // <-- Solo importar una vez

// Tutor pages
import BecomeTutor from './pages/Tutor/BecomeTutor';
import MyTutorProfile from './pages/Tutor/MyTutorProfile';
import ManageSchedule from './pages/Tutor/ManageSchedule';
import MyTutorias from './pages/Tutor/MyTutorias';

// User pages
import UserProfile from './pages/User/UserProfile';

// Admin pages
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTutors from './pages/Admin/AdminTutors';
import AdminReservations from './pages/Admin/AdminReservations';
import AdminReviews from './pages/Admin/AdminReviews';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Rutas de Estudiante */}
          <Route path="/tutors" element={<PrivateRoute><SearchTutors /></PrivateRoute>} />
          <Route path="/tutor/:id" element={<PrivateRoute><TutorProfile /></PrivateRoute>} />
          <Route path="/my-reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
          <Route path="/my-reviews" element={<PrivateRoute><MyReviews /></PrivateRoute>} />
          <Route path="/create-review" element={<PrivateRoute><CreateReview /></PrivateRoute>} />
          
          {/* Rutas de Tutor */}
          <Route path="/become-tutor" element={<PrivateRoute><BecomeTutor /></PrivateRoute>} />
          <Route path="/my-tutor-profile" element={<PrivateRoute><MyTutorProfile /></PrivateRoute>} />
          <Route path="/my-schedule" element={<PrivateRoute><ManageSchedule /></PrivateRoute>} />
          <Route path="/my-tutorias" element={<PrivateRoute><MyTutorias /></PrivateRoute>} />
          
          {/* Rutas de Usuario */}
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          
          {/* Rutas de Admin */}
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tutors" element={<AdminRoute><AdminTutors /></AdminRoute>} />
          <Route path="/admin/reservations" element={<AdminRoute><AdminReservations /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          
          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirige al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
