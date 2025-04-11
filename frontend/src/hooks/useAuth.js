import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              logout();
              return Promise.reject(error);
            }
            
            const response = await axios.post(`${backendUrl}/auth/token/refresh/`, {
              refresh: refreshToken
            });
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [backendUrl]);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken || !refreshToken) {
        setIsAuthenticated(false);
        setUserData(null);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${backendUrl}/auth/token/verify/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        const userData = {
          username: response.data.username,
          email: response.data.email
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUserData(userData);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setIsAuthenticated(false);
          setUserData(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, [backendUrl]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/auth/login/`, { email, password });
      
      if (data.success) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        const userData = {
          username: data.username,
          email: data.email
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUserData(userData);
        
        return { success: true };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUserData(null);
    
    axios.post(`${backendUrl}/auth/logout/`).catch(() => {
    });
  };

  return {
    isAuthenticated,
    isLoading,
    userData,
    login,
    logout
  };
};

export default useAuth;