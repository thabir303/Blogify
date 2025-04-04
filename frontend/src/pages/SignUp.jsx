import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

function SignUp() {
  const navigate = useNavigate();
  const {backendUrl} = useContext(AppContext);

  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + '/auth/register/', {
        username,
        email,
        password,
      });

      if (data.success) {
        toast.success(`Sign-Up successful! Check your mail to activate your account.`);

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const userData = {
          username: data.username,
          email: data.email,
        };
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate('/activate-email');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img onClick={() => navigate('/')} src={assets.logo} alt="" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">Create Account</h2>
        <p className="text-center text-sm mb-6">Create your Account</p>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.person_icon} alt="" />
            <input onChange={(e) => setUserName(e.target.value)} value={username} className="bg-transparent outline-none" type="text" placeholder="Full Name" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input onChange={(e) => setEmail(e.target.value)} value={email} className="bg-transparent outline-none" type="email" placeholder="Email account" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input onChange={(e) => setPassword(e.target.value)} value={password} className="bg-transparent outline-none" type={showPassword ? 'text' : 'password'} placeholder="Password" required />
            <img onClick={() => setShowPassword(!showPassword)} 
            src={showPassword ? assets.eye_open_icon : assets.eye_open_icon} 
            className="cursor-pointer  w-6 h-6" alt="toggle" />
          </div>

          {/* <p onClick={() => navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">
            Forgot password?
          </p> */}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">Sign Up</button>
        </form>

        <p className="text-gray-400 text-center text-xs mt-4">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-400 cursor-pointer underline">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
