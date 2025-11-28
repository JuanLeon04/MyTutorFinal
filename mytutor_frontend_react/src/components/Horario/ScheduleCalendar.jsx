import React from 'react';

const ScheduleCalendar = ({ horarios, onSelectHorario, onReservar }) => {
  const horariosDisponibles = horarios.filter((h) => h.estado === 'DISPONIBLE');

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      {horariosDisponibles.length === 0 ? (
        <p>No hay horarios disponibles</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {horariosDisponibles.map((horario) => (
            <div
              key={horario.id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{new Date(horario.fechaHora).toLocaleDateString()}</strong>
                <br />
                {new Date(horario.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                <br />
                <small>Duración: {horario.duracionMinutos} min</small>
              </div>
              <button
                onClick={() => onReservar(horario.id)}
                style={{ padding: '8px 15px' }}
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
