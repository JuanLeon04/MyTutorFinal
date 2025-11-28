import axios from 'axios';

const API_BASE_URL = "http://4.203.64.128:8081"; // Asegúrate de que esta URL sea la correcta

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // NO transformar requests ni responses para evitar conversiones de fecha
  transformRequest: [(data, headers) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }],
  transformResponse: [(data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }]
});

// Interceptor para manejar respuestas
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Request con token:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ Token inválido o expirado, redirigiendo a login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;