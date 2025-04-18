import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FiEdit, FiEye, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';
import UserAvatar from '../components/UserAvatar';
import BlogifyLogo from '../components/BlogifyLogo';
import LoginButton from '../components/LoginButton';
import DeleteModal from '../components/DeleteModal';

const BlogList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [allfilter, setAllFilter] = useState('all');
  const { backendUrl, userData, Logout } = useContext(AppContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter') || 'all';
    const pageParam = parseInt(queryParams.get('page')) || 1;
    
    setAllFilter(filterParam);
    setCurrentPage(pageParam);
    
    fetchBlogs(pageParam, filterParam);
  }, [location.search, backendUrl, userData]);

  const fetchBlogs = async (page = 1, filter = 'all') => {
    setLoading(true);
    try {
      let url = `${backendUrl}/blogs/?page=${page}`;
      
      if (filter !== 'all' && filter !== 'myblogs') {
        url += `&status=${filter}`;
      } else if (filter === 'myblogs') {
        url += `&status=myblogs`;
      }
      
      let response;
      if (userData) {
        const accessToken = localStorage.getItem('access_token');
        response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        response = await axios.get(url);
      }
      
      setBlogs(response.data.data);
      setTotalBlogs(response.data.count);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      toast.error('Error fetching blogs');
      // handleApiError(error, navigate)
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (option) => {
    setAllFilter(option);
    setCurrentPage(1);
    
    const searchParams = new URLSearchParams();
    searchParams.set('filter', option);
    searchParams.set('page', '1');
    navigate(`/blogs?${searchParams.toString()}`);
  };

  const confirmDelete = (blogId) => {
    setBlogToDelete(blogId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`${backendUrl}/blogs/${blogToDelete}/delete/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      toast.success('Blog deleted successfully');
      
      fetchBlogs(currentPage, allfilter);
      
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      toast.error('Error deleting blog');
      setShowDeleteModal(false);
      // handleApiError(error, navigate)
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const handleWriteClick = () => {
    if (userData) {
      navigate('/create-blog');
    } else {
      localStorage.setItem('returnUrl','/create-blog');

      toast.info('You must be logged in to post a blog', {
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const handleLogout = () => {
    Logout();
    navigate('/');
  };

  const isAuthor = (blog) => {
    return userData && blog.author === userData.username;
  };

  const changePage = (pageNumber) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', pageNumber.toString());
    navigate(`/blogs?${searchParams.toString()}`);
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      changePage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      changePage(currentPage - 1);
    }
  };
  
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className='w-full flex justify-between h-20 items-center p-2 sm:py-1 sm:px-6 md:px-6 lg:px-20
     z-50 transition-all duration-300'>
        <BlogifyLogo/>
          
        {userData ? (
          <UserAvatar/> 
        ) : (
          <LoginButton/>
        )}
      </div>
      
      <div className="py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
            
            <button onClick={handleWriteClick}
              className="flex items-center gap-1 py-1.5 px-3 sm:py-2 sm:px-4
               bg-indigo-600 text-white rounded-full hover:shadow-md hover:bg-indigo-700 transition-all duration-300">
              <i className='fi fi-rr-file-edit flex items-center text-sm'>
                <p className='ml-1 font-medium'>Write</p>
              </i>
            </button>
          </div>
          
          {userData && (
            <div className="flex justify-center mb-3">
              <div className="bg-white rounded-lg shadow-md p-1 inline-flex flex-wrap justify-center">
                <button 
                  onClick={() => handleFilter('all')}
                  className={`px-4 py-2 rounded-md transition-all 
                    ${allfilter === 'all' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}
                >
                  All
                </button>

                <button 
                  onClick={() => handleFilter('published')}
                  className={`px-4 py-2 rounded-md transition-all 
                    ${allfilter === 'published' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}
                >
                  Published
                </button>

                <button 
                  onClick={() => handleFilter('draft')}
                  className={`px-4 py-2 rounded-md transition-all 
                    ${allfilter === 'draft' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}
                >
                  Drafts
                </button>

                <button 
                  onClick={() => handleFilter('myblogs')}
                  className={`px-4 py-2 rounded-md transition-all 
                    ${allfilter === 'myblogs' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}
                >
                  My Blogs
                </button>
              </div>
            </div>
          )}
        
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div 
                    key={blog.id} 
                    className="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl"
                  >
                    <div className="p-4 relative">
                      <div 
                        className="absolute top-2 right-2 bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {isAuthor(blog) ? 'You' : blog.author}
                      </div>
                      
                      <div 
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-3 
                          ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                      >
                        {blog.status === 'published' ? (
                          <img src="/world.png" alt="Published" className="w-3 h-3" />
                        ) : (
                          <img src="/drafts (1).png" alt="Drafted" className="w-3 h-3" />
                        )}
                        {blog.status === 'published' ? 'Published' : 'Draft'}
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 text-gray-800 mt-1">{blog.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-3 text-sm">{blog.content.slice(0, 30)}...</p>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Created {moment(blog.created_at).fromNow()}</p>
                        <p>Updated {moment(blog.updated_at).fromNow()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-300">
                      <Link 
                        to={`/blogs/${blog.id}`} 
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        <FiEye className="mr-1" /> Read more
                      </Link>
                      
                      {isAuthor(blog) && (
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/blogs/${blog.id}/edit`} 
                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                          >
                            <FiEdit size={16} />
                          </Link>

                          <button 
                            onClick={() => confirmDelete(blog.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {blogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No blogs found.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <nav className="inline-flex rounded-md shadow-sm">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 bg-white text-sm font-medium
                        ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <FiChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => changePage(number)}
                        className={`relative inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-sm font-medium
                          ${currentPage === number 
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                            : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 bg-white text-sm font-medium
                        ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <FiChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteModal isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}  onDelete={handleDelete}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
      />
    </div>
  );
};

export default BlogList;