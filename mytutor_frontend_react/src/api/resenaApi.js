import axiosInstance from './axiosConfig';

export const resenaApi = {
  createResena: async (resenaData) => {
    console.log('📤 resenaApi.createResena - Datos:', JSON.stringify(resenaData, null, 2));
    try {
      const response = await axiosInstance.post('/api/resena', {
        idHorario: resenaData.idHorario,
        puntuacion: resenaData.puntuacion,
        comentario: resenaData.comentario
      });
      console.log('✅ resenaApi.createResena - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ resenaApi.createResena - Error:', error.response?.data || error.message);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Datos enviados:', resenaData);
      throw error;
    }
  },

  getResenasByTutor: async (idTutor) => {
    console.log('📡 resenaApi.getResenasByTutor - ID Tutor:', idTutor);
    console.log('📡 URL completa:', `http://localhost:8081/api/resena/tutor/${idTutor}`);
    try {
      const response = await axiosInstance.get(`/api/resena/tutor/${idTutor}`);
      console.log('✅ resenaApi.getResenasByTutor - Total:', response.data.length);
      console.log('✅ resenaApi.getResenasByTutor - Datos:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ resenaApi.getResenasByTutor - Error:', error.response?.data || error.message);
      console.error('❌ Status:', error.response?.status);
      return [];
    }
  },

  getMyResenas: async () => {
    console.log('📡 resenaApi.getMyResenas - Obteniendo mis reseñas...');
    try {
      const response = await axiosInstance.get('/api/resena');
      console.log('✅ resenaApi.getMyResenas - Total:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ resenaApi.getMyResenas - Error:', error.response?.data || error.message);
      return [];
    }
  },
};
