import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const ForgetPassword = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPinForm, setShowPinForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinValues, setPinValues] = useState(['', '', '', '', '', '']);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Initialize inputRefs when component mounts
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handlePinChange = (e, index) => {
    const value = e.target.value;
    // Update pinValues state
    const newPinValues = [...pinValues];
    newPinValues[index] = value;
    setPinValues(newPinValues);
    
    // Handle auto-focus to next input
    if (value.length > 0 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pinValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('').slice(0, 6);
    
    const newPinValues = [...pinValues];
    pasteArray.forEach((char, index) => {
      if (index < 6) {
        newPinValues[index] = char;
      }
    });
    
    setPinValues(newPinValues);
    
    // Focus the appropriate input after paste
    if (pasteArray.length < 6) {
      inputRefs.current[pasteArray.length].focus();
    } else {
      inputRefs.current[5].focus();
    }
  };

  const collectPin = () => {
    return pinValues.join('');
  };

  const requestPasswordReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!email) {
        toast.error('Email is required');
        setLoading(false);
        return;
      }
      
      const { data } = await axios.post(backendUrl + '/auth/password-reset/', { email });
      
      setLoading(false);
      toast.success('Password reset PIN sent to your email address');
      setShowPinForm(true);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || 'Something went wrong');
    }
  };

  const verifyPin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const pin = collectPin();
      
      if (pin.length !== 6) {
        toast.error('Please enter a valid 6-digit PIN');
        setLoading(false);
        return;
      }
      
      // Store pin for later use in password reset
      setPin(pin);
      setLoading(false);
      setShowNewPasswordForm(true);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || 'Invalid PIN');
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      // Use the stored pin instead of trying to read from refs
      const { data } = await axios.post(backendUrl + '/auth/password-reset-confirm/', {
        email,
        pin,
        new_password: newPassword
      });
      
      setLoading(false);
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || 'Password reset failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img 
        onClick={() => navigate('/')} 
        src={assets.blogify} 
        alt="Blogify Logo" 
        className="absolute left-5 sm:left-20 top-5 w-12 sm:w-20 cursor-pointer" 
      />
      
      {!showPinForm && !showNewPasswordForm ? (
        <form onSubmit={requestPasswordReset} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Your Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your email address to receive a reset code.
          </p>
          
          <div className="mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 bg-[#333A5C] text-white rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={50} />
            </div>
          ) : (
            <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
              Send Reset Code
            </button>
          )}
        </form>
      ) : showPinForm && !showNewPasswordForm ? (
        <form onSubmit={verifyPin} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Enter Verification Code
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email address.
          </p>
          
          <div className="flex justify-between mb-8">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => (inputRefs.current[index] = el)}
                value={pinValues[index]}
                onChange={(e) => handlePinChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={50} />
            </div>
          ) : (
            <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
              Verify Code
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={resetPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Set New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your new password below.
          </p>
          
          <div className="mb-4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 bg-[#333A5C] text-white rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 bg-[#333A5C] text-white rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <ClipLoader color="blue" size={50} />
            </div>
          ) : (
            <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
              Reset Password
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ForgetPassword;