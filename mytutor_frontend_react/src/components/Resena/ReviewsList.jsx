import React from 'react';

const ReviewsList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p>No hay reseñas disponibles</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>{review.estudiante?.nombre || 'Estudiante'}</strong>
            <span>{'⭐'.repeat(review.calificacion)}</span>
          </div>
          <p>{review.comentario}</p>
          <small style={{ color: '#666' }}>
            {new Date(review.fechaCreacion).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
