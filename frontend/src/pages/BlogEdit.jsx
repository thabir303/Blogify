import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiEye, FiFileText } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';

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
          `${backendUrl}/blogs/${blog_id}/`, 
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
      await axios.put(
        `${backendUrl}/blogs/${blog_id}/edit/`, 
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
  
  const handleLogout = () => {
    navigate('/');
    setTimeout(() => { 
        Logout();
    }, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full flex justify-between items-center p-2 sm:py-1 sm:px-4 md:px-4 lg:px-16 z-50 transition-all duration-300">
        <Link to="/" className="transition-transform duration-300 hover:scale-105">
          <img src={assets.blogify} className="w-14 sm:w-12 md:w-20" alt="Blogify Logo" />
        </Link>
        
        {userData && (
          <div className='w-8 h-8 sm:w-9 sm:h-9 flex justify-center items-center rounded-full
          bg-black text-white relative group cursor-pointer
          transition-all duration-300 hover:shadow-md hover:scale-105'>
          <span className='text-center font-medium'>{userData.username[0].toUpperCase()}</span>
          <div className='absolute hidden group-hover:block top-0 right-0
          z-10 text-black rounded pt-10 sm:pt-12'>
              <ul className='list-none m-0 p-0 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden w-28 sm:w-32'>
                  <li
                      onClick={handleLogout}  
                      className='py-2 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 text-gray-700 flex items-center gap-2'
                  >
                      <span className="w-4 h-4 flex items-center justify-center">
                          <i className="fi fi-rr-sign-out text-xs"></i>
                      </span>
                      <span>Logout</span>
                  </li>
              </ul>
          </div>
      </div>
        )}
      </div>
      
      <div className="py-4 px-3 sm:px-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Link to={`/blogs`}
              className="mr-3 text-gray-600 hover:text-indigo-600 transition-colors">
              <FiArrowLeft size={25} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Blog</h1>
          </div>
          
          <button
            onClick={togglePreview}
            className="flex items-center gap-1 py-1.5 px-3 sm:py-2 sm:px-4
              bg-white border border-indigo-300 text-indigo-600 rounded-full 
              hover:shadow-md hover:bg-indigo-50 transition-all duration-300" >
            {preview ? (
              <>
                <FiFileText className="text-indigo-600" />
                <span className="font-medium">Edit</span>
              </> ) : (
              <>
                <FiEye className="text-indigo-600" />
                <span className="font-medium">Preview</span>
              </>
            )}
          </button>
        </div>
        
        {preview ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">{formData.title || 'Untitled Blog'}</h2>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-4 
              ${formData.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
            >
              {formData.status === 'published' ? (
                <img src="/world.png" alt="Published" className="w-3 h-3" />
              ) : (
                <img src="/drafts (1).png" alt="Drafted" className="w-3 h-3" />
              )}
              {formData.status === 'published' ? 'Published' : 'Draft'}
            </div>
            <div className="prose max-w-none">
              {formData.content.split('\n').map((paragraph, idx) => (
                paragraph ? <p key={idx} className="mb-4">{paragraph}</p> : <br key={idx} />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                Title
              </label>
              <input type="text" id="title" name="title" value={formData.title}
                onChange={handleChange} placeholder="Enter blog title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-1">
                Content
              </label>
              <textarea id="content" name="content" value={formData.content} onChange={handleChange}
                placeholder="Write your blog content here..." rows="12"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <button type="button" onClick={() => handleStatusChange('draft')}
                  disabled={initialStatus === 'published'}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2
                    ${initialStatus === 'published' 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70' 
                      : formData.status === 'draft' 
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`} >
                  <img src="/drafts (1).png" alt="Draft" className="w-4 h-4" />
                  <span>Save as Draft</span>
                </button>
                
                <button type="button" onClick={() => handleStatusChange('published')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center gap-2
                    ${formData.status === 'published' 
                      ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                      : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`} >
                  <img src="/world.png" alt="Published" className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              </div>
              {initialStatus === 'published' && (
                <p className="text-xs text-amber-600 mt-2">
                  Note: Published blogs cannot be changed back to draft status
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-4">
              {/* Also updated the cancel button to navigate to individual blog page */}
              <Link to={`/blogs`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              
              <button type="submit" disabled={loading}
                className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2" >
                {loading ? (
                  <span>Saving...</span> ) : (
                  <>
                    <FiSave />
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogEdit;