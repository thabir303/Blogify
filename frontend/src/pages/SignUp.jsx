import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { ClipLoader } from 'react-spinners'; 
import apiClient from '../utils/apiClient';

function SignUp() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true); 

      const response = await apiClient.post(`${backendUrl}/auth/register/`, {
        username,
        email,
        password,
      });

      setLoading(false);
      
      if (response.data.success) {
        toast.success(`Sign-Up successful! Check your mail to activate your account.`);
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        const userData = {
          username: response.data.username,
          email: response.data.email,
        };
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate('/activate-email');
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      setLoading(false);
      
      if (error.response && error.response.data) {
        if (error.response.data.email) {
          toast.error(`Email error: ${error.response.data.email[0]}`);
        } else if (error.response.data.username) {
          toast.error(`Username error: ${error.response.data.username[0]}`);
        } else if (error.response.data.password) {
          toast.error(`Password error: ${error.response.data.password[0]}`);
        } else if (error.response.data.detail) {
          toast.error(error.response.data.detail);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img onClick={() => navigate('/')} src={assets.blogify} alt="" className="absolute left-5 sm:left-20 top-5 w-12  sm:w-20 cursor-pointer" />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">Create Account</h2>
        <p className="text-center text-sm mb-6">Create your Account</p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.person_icon} alt="" />
            <input onChange={(e) => setUserName(e.target.value)} value={username} className="bg-transparent outline-none w-full" type="text" placeholder="Full Name" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input onChange={(e) => setEmail(e.target.value)} value={email} className="bg-transparent outline-none w-full" type="email" placeholder="Email account" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input onChange={(e) => setPassword(e.target.value)} value={password} className="bg-transparent outline-none w-full" type={showPassword ? 'text' : 'password'} placeholder="Password" required />
            <img onClick={() => setShowPassword(!showPassword)} src={showPassword ? assets.eye_open_icon : assets.eye_open_icon} className="cursor-pointer w-6 h-6" alt="toggle" />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={50} />
            </div>
          ) : (
            <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">Sign Up</button>
          )}
        </form>

        <p className="text-gray-400 text-center text-xs mt-4">
          Already a member?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-400 cursor-pointer underline">
            Sign in here.
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;