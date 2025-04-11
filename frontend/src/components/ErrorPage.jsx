import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const ErrorPage = ({ statusCode, message, redirectPath = '/' }) => {
  const navigate = useNavigate();

  const getDefaultMessage = (code) => {
    switch (code) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'You need to be logged in to access this page.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The page you are looking for does not exist.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const errorMessage = message || getDefaultMessage(statusCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <img 
        onClick={() => navigate('/')} 
        src={assets.blogify} 
        alt="Blogify" 
        className="absolute left-5 sm:left-20 top-5 w-12 sm:w-20 cursor-pointer" 
      />
      
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg max-w-lg w-full text-center">
        <div className="text-6xl font-bold text-indigo-600 mb-4">
          {statusCode}
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-8">
          {errorMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          
          <Link 
            to={redirectPath} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            {redirectPath === '/' ? 'Go Home' : 'Try Again'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;