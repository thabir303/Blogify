import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';

const BlogList = () => {

  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [allfilter, setAllFilter] = useState('all');
  const { backendUrl, userData } = useContext(AppContext);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        let response;
        if (userData) {
          const accessToken = localStorage.getItem('access_token');
          response = await axios.get(backendUrl + '/blogs/', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else {
          response = await axios.get(backendUrl + '/blogs/');
        }
        
        setBlogs(response.data.data);
        setFilteredBlogs(response.data.data);
      } catch (error) {
        toast.error('Error fetching blogs');
      }
    };
    fetchBlogs();
  }, [backendUrl, userData]);

  const handleFilter = (option) => {
    setAllFilter(option);
    if (option === 'all') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.status === option));
    }
  };

  const handleDelete = async (blogId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.delete(`${backendUrl}/blogs/${blogId}/delete/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      toast.success('Blog deleted successfully');
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      setFilteredBlogs(filteredBlogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      toast.error('Error deleting blog');
    }
  };

  const isAuthor = (blog) => {
    return userData && blog.author === userData.username;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Blogs
        </h1>
        
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button onClick=
              {() => handleFilter('all')}
              className={`px-4 py-2 rounded-md transition-all 
                ${allfilter === 'all' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}>
                                 All
            </button>

            <button onClick=
              {() => handleFilter('published')}
               className={`px-4 py-2 rounded-md transition-all 
                ${allfilter === 'published' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}>
                                Published
            </button>

            {userData && ( <button onClick=
                {() => handleFilter('draft')}
                className={`px-4 py-2 rounded-md transition-all 
                ${allfilter === 'draft' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-300'}`}>
                                Drafts
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} 
             className="bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
              <div className="p-6 relative">
                <div 
                 className="absolute top-3 right-3 bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  {isAuthor(blog) ? 'You' : blog.author}
                </div>
                
                <div className=
                  {`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 
                   ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>

                  {blog.status === 'published' ? (
                    <img src="/world.png" alt="Published" className="w-4 h-4" /> ) 
                    : (
                    <img src="/drafts (1).png" alt="Drafted" className="w-4 h-4" />
                      )}
                  {blog.status === 'published' ? 'Published' : 'Draft'}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 mt-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.content.slice(0, 30)}...</p>
                
                <div className="text-xs text-gray-500 mt-2">
                  <p>Created {moment(blog.created_at).fromNow()}</p>
                  <p>Updated {moment(blog.updated_at).fromNow()}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-300">
                <Link to={`/blogs/${blog.id}`} 
                  className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                  <FiEye className="mr-1" /> Read more
                </Link>
                
                {isAuthor(blog) && (
                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/blogs/${blog.id}/edit`} 
                      className="text-gray-600 hover:text-indigo-600 transition-colors">
                      <FiEdit size={18} />
                    </Link>

                    <button onClick=
                      {() => handleDelete(blog.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No blogs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;