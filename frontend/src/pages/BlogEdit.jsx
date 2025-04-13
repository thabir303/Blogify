import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiEye, FiFileText } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';
import UserAvatar from '../components/UserAvatar';
import BlogifyLogo from '../components/BlogifyLogo';
import BlogForm from '../components/BlogForm';

const BlogEdit = () => {
  const navigate = useNavigate();
  const { blog_id } = useParams();
  const { backendUrl, userData, Logout } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [initialStatus, setInitialStatus] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: ''
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(
          `${backendUrl}/api/blogs/${blog_id}/`, 
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        const blogData = response.data.blog;
        
        setIsAuthor(true);
        setFormData({
          title: blogData.title,
          content: blogData.content,
          status: blogData.status
        });
        setInitialStatus(blogData.status);
        
      } catch (error) {
        console.error('Error fetching blog:', error);
        toast.error('Failed to fetch blog details');
        navigate('/blogs');
      }
    };

    fetchBlog();
  }, [backendUrl, userData, blog_id, navigate]);

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleStatusChange = (status) => {
    if (initialStatus === 'published' && status === 'draft') {
      toast.error('Published blogs cannot be changed to draft');
      return;
    }
    
    setFormData({
      ...formData,
      status
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      await axios.put( `${backendUrl}/api/blogs/${blog_id}/edit/`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Blog updated successfully');
      navigate(`/blogs`);
    } catch (error) {
      console.error('Error updating blog:', error);
      // handleApiError(error, navigate)
      if (error.response?.data?.message === 'Published posts cannot be changed to draft mood.') {
        toast.error('Published blogs cannot be changed to draft status');
      } else {
        toast.error(error.response?.data?.errors || 'Failed to update blog');
      }
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full flex justify-between items-center p-2 sm:py-1 sm:px-4 md:px-4 lg:px-16 z-50 transition-all duration-300">
        <BlogifyLogo/>
        
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
          initialStatus={initialStatus}
          isEditMode={true}
          cancelUrl="/blogs"
        />
      </div>
    </div>
  );
};

export default BlogEdit;