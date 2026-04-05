import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

function Login() {
  const navigate = useNavigate();
  const { backendUrl, SetIsLoggedin, SetUserData } = useContext(AppContext);

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

        toast.success(`Signed in successfully. Welcome back, ${userData.username}.`);
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
        toast.error(data.message || 'Unable to sign in. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || error.message || 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="auth-shell flex items-center justify-center min-h-screen px-4 xs:px-6 sm:px-0">
      <span className="auth-orb auth-orb-one" />
      <span className="auth-orb auth-orb-two" />
      <img 
        onClick={() => navigate('/')} 
        src={assets.blogify} 
        alt="Blogify logo" 
        className="auth-logo-btn absolute left-3 xs:left-5 sm:left-10 md:left-20 top-3 xs:top-5 w-10 xs:w-12 sm:w-16 md:w-20 cursor-pointer transition-transform duration-300 hover:scale-105" 
      />
      <div className="auth-card p-6 xs:p-8 sm:p-10 rounded-2xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:w-[25rem] text-indigo-200 text-xs xs:text-sm">
        <h2 className="auth-title text-2xl xs:text-3xl sm:text-[2rem] font-semibold text-white text-center mb-2 xs:mb-3">
          Welcome Back
        </h2>
        <p className="auth-subtitle text-center text-xs xs:text-sm mb-5 xs:mb-6">
          Sign in to continue to your Blogify workspace.
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div className="auth-input-wrap flex items-center gap-2 xs:gap-3 w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-full">
            <img src={assets.mail_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className="auth-input bg-transparent outline-none w-full text-xs xs:text-sm text-slate-100" 
              type="email" 
              placeholder="Work email address" 
              autoComplete="email"
              required 
            />
          </div>

          <div className="auth-input-wrap flex items-center gap-2 xs:gap-3 w-full px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-full">
            <img src={assets.lock_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className="auth-input bg-transparent outline-none w-full text-xs xs:text-sm text-slate-100" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password" 
              autoComplete="current-password"
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center focus:outline-none"
            >
              <img
                src={showPassword ? assets.eye_open_icon : assets.eye_open_icon}
                className="cursor-pointer w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"
                alt="Toggle password visibility"
              />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="#60a5fa" size={34} className="my-2" />
            </div>
          ) : (
            <button
              type="submit"
              className="auth-primary-btn w-full py-2 xs:py-2.5 rounded-full text-white font-medium text-xs xs:text-sm"
            >
              Sign In
            </button>
          )}
        </form>

        <p
          onClick={() => navigate('/forgot-password')}
          className="mb-3 xs:mb-4 mt-4 auth-link cursor-pointer text-xs xs:text-sm"
        >
          Need help signing in?
        </p>

        <p className="auth-note text-center text-xs mt-3 xs:mt-4">
          New to Blogify?{' '}
          <span onClick={() => navigate('/signup')} className="auth-link cursor-pointer underline">
            Create an account.
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;