import axiosInstance from './axiosConfig';

export const horarioApi = {
  updateHorario: async (idHorario, horarioData) => {
    const response = await axiosInstance.put(`/api/horario/${idHorario}`, horarioData);
    return response.data;
  },

  deleteHorario: async (idHorario) => {
    console.log('🗑️ horarioApi.deleteHorario - ID Horario:', idHorario);
    try {
      const response = await axiosInstance.delete(`/api/horario/${idHorario}`);
      console.log('✅ horarioApi.deleteHorario - Horario desactivado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ horarioApi.deleteHorario - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  createHorario: async (horarioData) => {
    console.log('📤 DATOS ORIGINALES (JavaScript):');
    console.log('  fechaInicio:', horarioData.fechaInicio);
    console.log('  fechaFin:', horarioData.fechaFin);
    console.log('  Tipo:', typeof horarioData.fechaInicio);
    
    // Convertir a JSON string manualmente
    const jsonPayload = JSON.stringify(horarioData);
    console.log('📦 JSON String que se enviará:', jsonPayload);
    
    try {
      const response = await axiosInstance({
        method: 'post',
        url: '/api/horario/crear',
        data: jsonPayload,
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [(data) => data],
        transformResponse: [(data) => data]
      });
      
      const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log('✅ RESPUESTA del backend:');
      console.log('  fechaInicio guardada:', result.fechaInicio);
      console.log('  fechaFin guardada:', result.fechaFin);
      
      return result;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      throw error;
    }
  },

  listAllHorarios: async () => {
    console.log('📡 horarioApi.listAllHorarios - Obteniendo MIS horarios como tutor...');
    try {
      const response = await axiosInstance.get('/api/horario/listMyHorarios');
      console.log('✅ horarioApi.listAllHorarios - Total horarios:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primer horario:', JSON.stringify(response.data[0], null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ horarioApi.listAllHorarios - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  listAllHorariosAdmin: async () => {
    console.log('📡 horarioApi.listAllHorariosAdmin - Obteniendo TODOS los horarios (ADMIN)...');
    try {
      const response = await axiosInstance.get('/api/horario/list');
      console.log('✅ horarioApi.listAllHorariosAdmin - Total horarios:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primer horario:', JSON.stringify(response.data[0], null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ horarioApi.listAllHorariosAdmin - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAvailableHorarios: async () => {
    console.log('📡 horarioApi.getAvailableHorarios - Obteniendo horarios disponibles globales...');
    try {
      const response = await axiosInstance.get('/api/horario/disponibles');
      console.log('✅ horarioApi.getAvailableHorarios - Total:', response.data.length);
      console.log('✅ horarioApi.getAvailableHorarios - Datos completos:', JSON.stringify(response.data, null, 2));
      
      // Filtrar nulls que vienen del backend
      const horariosValidos = response.data.filter(h => h !== null && h !== undefined);
      console.log('✅ Horarios válidos (sin nulls):', horariosValidos.length);
      
      return horariosValidos;
    } catch (error) {
      console.error('❌ horarioApi.getAvailableHorarios - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyHorarios: async () => {
    console.log('📡 horarioApi.getMyHorarios - Obteniendo MIS horarios como tutor...');
    try {
      const response = await axiosInstance.get('/api/horario/listMyHorarios');
      console.log('✅ horarioApi.getMyHorarios - Total horarios:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primer horario:', JSON.stringify(response.data[0], null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ horarioApi.getMyHorarios - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  filtrarHorarios: async (filtros = {}) => {
    console.log("📡 horarioApi.filtrarHorarios - Filtros enviados:", filtros);

    try {
      const response = await axiosInstance.get('/api/horario/filtrar', {
        params: filtros
      });

      console.log("✅ Horarios filtrados:", response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ horarioApi.filtrarHorarios - Error:', error.response?.data || error.message);
      throw error;
    }
  },
};
