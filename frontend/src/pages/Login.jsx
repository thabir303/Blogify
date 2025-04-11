import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; 
import apiClient, { handleApiError } from '../utils/apiClient';

function Login() {
  const navigate = useNavigate();
  const { backendUrl, SetIsLoggedin, userData, SetUserData } = useContext(AppContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (userData && userData.email) {
      setEmail(userData.email);
    }
  }, []);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true); 

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + '/auth/login/', { email, password });

      setLoading(false); 

      if (data.success) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const userData = {
          username: data.username,
          email: data.email,
        };
        localStorage.setItem('user_data', JSON.stringify(userData));

        toast.success(`Login successful! Welcome ${userData.username}`);
        SetUserData(userData);
        SetIsLoggedin(true);

        const returnUrl = localStorage.getItem('returnUrl');
        if(returnUrl){
          localStorage.removeItem('returnUrl');
          navigate(returnUrl);
        }
        else{
          navigate('/')
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 xs:px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img 
        onClick={() => navigate('/')} 
        src={assets.blogify} 
        alt="" 
        className="absolute left-3 xs:left-5 sm:left-10 md:left-20 top-3 xs:top-5 w-10 xs:w-12 sm:w-16 md:w-20 cursor-pointer transition-transform duration-300 hover:scale-105" 
      />
      <div className="bg-slate-900 p-6 xs:p-8 sm:p-10 rounded-lg shadow-lg w-full max-w-xs xs:max-w-sm sm:max-w-md md:w-96 text-indigo-300 text-xs xs:text-sm">
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold text-white text-center mb-2 xs:mb-3">Login</h2>
        <p className="text-center text-xs xs:text-sm mb-4 xs:mb-6">Login to your account</p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 xs:mb-4 flex items-center gap-2 xs:gap-3 w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className="bg-transparent outline-none w-full text-xs xs:text-sm" 
              type="email" 
              placeholder="Email account" 
              required 
            />
          </div>

          <div className="mb-4 flex items-center gap-2 xs:gap-3 w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className="bg-transparent outline-none w-full text-xs xs:text-sm" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              required 
            />
            <img onClick={() => setShowPassword(!showPassword)} 
              src={showPassword ? assets.eye_open_icon : assets.eye_open_icon} 
              className="cursor-pointer w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" 
              alt="toggle" 
            />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={36} className="my-2" />
            </div>
          ) : (
            <button className="w-full py-2 xs:py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium text-xs xs:text-sm transition-all duration-300 hover:shadow-lg hover:opacity-90">Login</button>
          )}
        </form>

        <p onClick={() => navigate('/forgot-password')} 
          className="mb-3 xs:mb-4 text-indigo-500 cursor-pointer text-xs xs:text-sm hover:text-indigo-400 transition-colors"
        >
          Forgot password?
        </p>

        <p className="text-gray-400 text-center text-xs mt-3 xs:mt-4">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')} className="text-blue-400 cursor-pointer underline hover:text-blue-300 transition-colors">
            Join us today.
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;