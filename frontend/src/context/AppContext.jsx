import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient, { handleApiError } from "../utils/apiClient";

export const AppContext = createContext();

export const AppContextProvider = (props) =>{

    const navigate = useNavigate()
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, SetIsLoggedin] = useState(false)
    const [userData, SetUserData] = useState(null)

    const Logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        toast.success(`Logout successful!`)
        SetIsLoggedin(false);
        SetUserData(null);
        navigate('/')
    }

    const getAuthState = async() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if(!accessToken || ! refreshToken){
            SetIsLoggedin(false);
            SetUserData(null);
            return;
        }

        try {
            const response = await apiClient.get(backendUrl + '/api/auth/token/verify/',{
                headers: {
                    Authorization:`Bearer ${accessToken}`,
                },
            });

         const userData = {
            username: response.data.username,
            email: response.data.email,
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        SetIsLoggedin(true);
        SetUserData(userData);
        } catch (error) {
            handleApiError(error, navigate)
            console.error("Error:", error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                try {
                  const refreshResponse = await apiClient.post(backendUrl + '/api/auth/token/refresh/', {
                    refresh: refreshToken,
                  });
        
                  const newAccessToken = refreshResponse.data.access;
                  localStorage.setItem("access_token", newAccessToken);

                  getAuthState();
                } catch (error) {
                  SetIsLoggedin(false);
                  SetUserData(null);
                  localStorage.removeItem('user_data');
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  handleApiError(error, navigate)
                }
              }
            }
    };
    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const parsedUserData = JSON.parse(userData);
                    SetUserData(parsedUserData);
                    SetIsLoggedin(true);
        } else {
            getAuthState();
        }
    }, []);

    const value = {
        backendUrl,
        isLoggedin, SetIsLoggedin,
        userData, SetUserData,
        getAuthState,
        Logout,

    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}