import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiEye, FiFileText } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';
import UserAvatar from '../components/UserAvatar';
import BlogifyLogo from '../components/BlogifyLogo';
import BlogForm from '../components/BlogForm';

const BlogCreate = () => {
  const navigate = useNavigate();
  const { backendUrl, userData, Logout } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '',
    content: '',
    status: 'draft'
  });

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
        Logout();
      }, 10);
  };

//   const redirectToLoginWithReturnUrl = () => {
//     localStorage.setItem('returnUrl', '/blogs/create');
    
//     toast.info('You must be logged in to create a blog', {
//       autoClose: 2000,
//     });
    
//     setTimeout(() => {
//       navigate('/login');
//     }, 2000);
//   };

  useEffect(() => {
    if (!userData) {
    //   redirectToLoginWithReturnUrl();
    }
  }, [userData]);

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleStatusChange = (status) => {
    setFormData({
      ...formData,
      status
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // if (!userData) {
    //     redirectToLoginWithReturnUrl();
    //     return;
    // }
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(`${backendUrl}/blogs/create/`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Blog created successfully');
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error(error.response?.data?.errors || 'Failed to create blog');
    // handleApiError(error, navigate);
     if (error.response && error.response.status === 401) {
        redirectToLoginWithReturnUrl();
      }
    } 
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  if(!userData){
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full flex justify-between items-center p-2 sm:py-1 sm:px-4 md:px-4 lg:px-16 z-50 transition-all duration-300">
        <BlogifyLogo />
        
        {userData && (
             <UserAvatar/>
        )}
      </div>
      
      <div className="py-4 px-3 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <Link to="/blogs"
            className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
            <FiArrowLeft size={20} className="mr-2" />
            Back to Blogs
          </Link>
        </div>
        
        <BlogForm
          formData={formData}
          onChange={handleFormChange}
          onStatusChange={handleStatusChange}
          onSubmit={handleSubmit}
          loading={loading}
          initialStatus={formData.status}
          isEditMode={false}
          cancelUrl="/blogs"
        />
      </div>
    </div>
  );
};

export default BlogCreate;