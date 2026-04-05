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
        toast.success('Account created successfully. Please verify your email to continue.');

        const userData = {
          username: response.data.username,
          email: response.data.email,
        };
        localStorage.setItem('user_data', JSON.stringify(userData));

        navigate('/activate-email');
      } else {
        toast.error(response.data.message || 'Registration failed');
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
          toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
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
          Create Your Account
        </h2>
        <p className="auth-subtitle text-center text-xs xs:text-sm mb-5 xs:mb-6">
          Start writing and managing your stories with confidence.
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div className="auth-input-wrap flex items-center gap-3 w-full px-4 sm:px-5 py-2.5 rounded-full">
            <img src={assets.person_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input
              onChange={(e) => setUserName(e.target.value)}
              value={username}
              className="auth-input bg-transparent outline-none w-full text-slate-100"
              type="text"
              placeholder="Full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-input-wrap flex items-center gap-3 w-full px-4 sm:px-5 py-2.5 rounded-full">
            <img src={assets.mail_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="auth-input bg-transparent outline-none w-full text-slate-100"
              type="email"
              placeholder="Work email address"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-input-wrap flex items-center gap-3 w-full px-4 sm:px-5 py-2.5 rounded-full">
            <img src={assets.lock_icon} alt="" className="w-4 h-4 xs:w-5 xs:h-5" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="auth-input bg-transparent outline-none w-full text-slate-100"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center focus:outline-none"
            >
              <img
                src={showPassword ? assets.eye_open_icon : assets.eye_open_icon}
                className="cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                alt="Toggle password visibility"
              />
            </button>
          </div>

          <p className="auth-note text-[11px] xs:text-xs -mt-1">
            Use at least 6 characters for a stronger password.
          </p>

          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="#60a5fa" size={34} className="my-2" />
            </div>
          ) : (
            <button
              type="submit"
              className="auth-primary-btn w-full py-2.5 rounded-full text-white font-medium text-xs xs:text-sm"
            >
              Create Account
            </button>
          )}
        </form>

        <p className="auth-note text-center text-xs mt-4">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="auth-link cursor-pointer underline">
            Sign in.
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;