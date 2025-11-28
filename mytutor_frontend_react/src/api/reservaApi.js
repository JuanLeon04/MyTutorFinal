import axiosInstance from './axiosConfig';

export const reservaApi = {
  marcarCompletada: async (idHorario) => {
    console.log('✅ reservaApi.marcarCompletada - ID Horario:', idHorario);
    try {
      const response = await axiosInstance.put(`/api/reserva/${idHorario}/completada`);
      console.log('✅ reservaApi.marcarCompletada - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.marcarCompletada - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  marcarNoAsistio: async (idHorario) => {
    console.log('❌ reservaApi.marcarNoAsistio - ID Horario:', idHorario);
    try {
      const response = await axiosInstance.put(`/api/reserva/${idHorario}/no-asistio`);
      console.log('✅ reservaApi.marcarNoAsistio - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.marcarNoAsistio - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  createReserva: async (idHorario) => {
    console.log('📤 reservaApi.createReserva - ID Horario:', idHorario);
    console.log('📤 URL completa:', `http://localhost:8081/api/reserva/${idHorario}`);
    try {
      const response = await axiosInstance.post(`/api/reserva/${idHorario}`);
      console.log('✅ reservaApi.createReserva - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.createReserva - Error:', error.response?.data || error.message);
      console.error('❌ Status:', error.response?.status);
      throw error;
    }
  },

  cancelReserva: async (horarioId) => {
    console.log('❌ reservaApi.cancelReserva - ID Horario:', horarioId);
    try {
      const response = await axiosInstance.delete(`/api/reserva/${horarioId}`);
      console.log('✅ reservaApi.cancelReserva - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.cancelReserva - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  cancelReservaTutor: async (idHorario) => {
    console.log('❌ reservaApi.cancelReservaTutor - ID Horario:', idHorario);
    try {
      const response = await axiosInstance.delete(`/api/reserva/tutor/${idHorario}`);
      console.log('✅ reservaApi.cancelReservaTutor - Reserva cancelada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.cancelReservaTutor - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyReservas: async () => {
    console.log('📡 reservaApi.getMyReservas - Obteniendo mis reservas...');
    try {
      const response = await axiosInstance.get('/api/reserva');
      console.log('✅ reservaApi.getMyReservas - Total:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primera reserva:', JSON.stringify(response.data[0], null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.getMyReservas - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  listAllReservas: async () => {
    console.log('📡 reservaApi.listAllReservas - Obteniendo todas las reservas...');
    try {
      const response = await axiosInstance.get('/api/reserva/list');
      console.log('✅ reservaApi.listAllReservas - Total:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ reservaApi.listAllReservas - Error:', error.response?.data || error.message);
      throw error;
    }
  },
};
