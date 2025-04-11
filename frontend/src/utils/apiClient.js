import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          return Promise.reject({ 
            status: 401, 
            message: 'Session expired. Please login again.' 
          });
        }
        
        const refreshResponse = await axios.post(
          `${backendUrl}/auth/token/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('access_token', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        return Promise.reject({ 
          status: 401, 
          message: 'Authentication failed. Please login again.' 
        });
      }
    }
    
    const errorInfo = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 
               error.response?.data?.error || 
               error.response?.data?.detail ||
               error.message || 
               'An unexpected error occurred'
    };
    
    return Promise.reject(errorInfo);
  }
);

export const handleApiError = (error, navigate) => {
  console.error('API Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'An unexpected error occurred';
  
  switch (status) {
    case 401:
      toast.error('Session expired. Please login again.');
      if (navigate) navigate('/login', { 
        state: { errorStatus: status, errorMessage: message } 
      });
      break;
      
    case 403:
      toast.error('You do not have permission to perform this action.');
      if (navigate) navigate('/', { 
        state: { errorStatus: status, errorMessage: message } 
      });
      break;
      
    case 404:
      if (navigate) navigate('/not-found', { 
        state: { errorStatus: status, errorMessage: message } 
      });
      break;
      
    case 500:
    case 502:
    case 503:
    case 504:
      toast.error('Server error. Please try again later.');
      if (navigate) navigate('/server-error', { 
        state: { errorStatus: status, errorMessage: message } 
      });
      break;
      
    default:
      toast.error(message);
      break;
  }
  
  return { status, message };
};

export default apiClient;