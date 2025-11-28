import React from 'react';
import { Link } from 'react-router-dom';

const ReservationCard = ({ reserva, onCancel, onRefresh }) => {
  const canCancel = reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';
  
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      borderRadius: '8px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px'
    }}>
      <div>
        <h3>Reserva con {reserva.horario?.tutor?.usuario?.nombre || 'Tutor'}</h3>
        <p><strong>Fecha:</strong> {new Date(reserva.horario?.fechaHora).toLocaleDateString()}</p>
        <p><strong>Hora:</strong> {new Date(reserva.horario?.fechaHora).toLocaleTimeString()}</p>
        <p><strong>Duración:</strong> {reserva.horario?.duracionMinutos} minutos</p>
        <p><strong>Estado:</strong> <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: reserva.estado === 'COMPLETADA' ? '#4caf50' : 
                          reserva.estado === 'CANCELADA' ? '#f44336' : 
                          reserva.estado === 'CONFIRMADA' ? '#2196f3' : '#ff9800',
          color: 'white'
        }}>{reserva.estado}</span></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {canCancel && (
          <button
            onClick={() => onCancel(reserva.horario?.id)}
            style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Cancelar Reserva
          </button>
        )}
        
        {reserva.estado === 'COMPLETADA' && !reserva.resenaId && (
          <Link to={`/create-review/${reserva.horario?.tutor?.id}`}>
            <button style={{ width: '100%', padding: '10px' }}>
              Dejar Reseña
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
