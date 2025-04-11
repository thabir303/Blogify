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
        // navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      // handleApiError(error, navigate)
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img onClick={() => navigate('/')} src={assets.blogify} alt="" className="absolute left-5 sm:left-20 top-5 w-12  sm:w-20 cursor-pointer" />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">Login</h2>
        <p className="text-center text-sm mb-6">Login to your account</p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input onChange={(e) => setEmail(e.target.value)} value={email} className="bg-transparent outline-none" type="email" placeholder="Email account" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input onChange={(e) => setPassword(e.target.value)} value={password} className="bg-transparent outline-none" type={showPassword ? 'text' : 'password'} placeholder="Password" required />
            <img onClick={() => setShowPassword(!showPassword)} src={showPassword ? assets.eye_open_icon : assets.eye_open_icon} className="cursor-pointer w-6 h-6" alt="toggle" />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={50} />
            </div>
          ) : (
            <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">Login</button>
          )}
        </form>

        <p onClick={() => navigate('/forgot-password')} className="mb-4 text-indigo-500 cursor-pointer">
          Forgot password?
        </p>

        <p className="text-gray-400 text-center text-xs mt-4">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')} className="text-blue-400 cursor-pointer underline">
            Join us today.
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
