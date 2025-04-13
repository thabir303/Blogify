import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import apiClient from '../utils/apiClient'

const DashboardPage = () => {
  const { userData, backendUrl } = useContext(AppContext)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  
  const userInitial = userData ? userData.username[0].toUpperCase() : ''
  
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!userData) return
      
      try {
        setLoading(true)
        const response = await apiClient.get(`${backendUrl}/api/blogs/user/`)
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setBlogs(response.data.data)
        } else {
          console.error('Unexpected API response format:', response.data)
          setBlogs([])
        }
      } catch (error) {
        console.error('Error fetching user blogs:', error)
        setBlogs([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserBlogs()
  }, [userData, backendUrl])
  
  const calculateTotalViews = () => {
    if (!Array.isArray(blogs)) return 0
    
    return blogs.reduce((total, blog) => {
      const views = typeof blog.views === 'number' ? blog.views : 0
      return total + views
    }, 0)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 xs:pt-24 sm:pt-28 px-4 xs:px-6 sm:px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between mb-8 xs:mb-10 sm:mb-12">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center gap-3 xs:gap-4 mb-2 xs:mb-3">
              <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-14 sm:h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl xs:text-3xl sm:text-4xl font-semibold">
                {userInitial}
              </div>
              <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800">
                  {userData ? userData.username : 'User'}'s Dashboard
                </h1>
                <p className="text-sm xs:text-base text-gray-600">{userData ? userData.email : ''}</p>
              </div>
            </div>
          </div>
          
          <Link to="/create-blog" className="flex items-center gap-2 bg-indigo-600 text-white px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-md">
            <i className="fi fi-rr-plus"></i>
            <span>Create New Blog</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border  border-gray-500 p-6 xs:p-7 sm:p-8 mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-4 xs:mb-5 sm:mb-6 text-gray-800">My Stats</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
            <div className="bg-indigo-50 rounded-lg p-4 xs:p-5 sm:p-6 border border-indigo-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-700 font-medium">Total Blogs</h3>
                <span className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-indigo-600/10 flex items-center justify-center">
                  <i className="fi fi-rr-document text-indigo-600"></i>
                </span>
              </div>
              <p className="text-3xl xs:text-4xl font-bold text-indigo-600 mt-2">
                {loading ? '...' : Array.isArray(blogs) ? blogs.length : 0}
              </p>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4 xs:p-5 sm:p-6 border border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-700 font-medium">Total Views</h3>
                <span className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-emerald-600/10 flex items-center justify-center">
                  <i className="fi fi-rr-eye text-emerald-600"></i>
                </span>
              </div>
              <p className="text-3xl xs:text-4xl font-bold text-emerald-600 mt-2">
                {loading ? '...' : calculateTotalViews()}
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 xs:p-5 sm:p-6 border border-amber-100 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-700 font-medium">Account Status</h3>
                <span className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-amber-600/10 flex items-center justify-center">
                  <i className="fi fi-rr-user text-amber-600"></i>
                </span>
              </div>
              <p className="text-lg xs:text-xl font-semibold text-amber-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full bg-green-500"></span>
                Active
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-500 p-6 xs:p-7 sm:p-8">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-medium mb-4 xs:mb-5 sm:mb-6 text-gray-800">My Blogs</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col  items-center justify-center py-12 xs:py-16 sm:py-20 text-center">
              <img src={assets.empty_blogs || '/empty-blogs.svg'} alt="No blogs" className="w-40 xs:w-48 sm:w-56 mb-6" />
              <h3 className="text-lg xs:text-xl font-medium text-gray-700 mb-2">No blogs yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">You haven't created any blogs yet. Start writing and sharing your thoughts with the world!</p>
              <Link to="/create-blog" className="flex items-center gap-2 bg-indigo-600 text-white px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-md">
                <i className="fi fi-rr-plus"></i>
                <span>Create Your First Blog</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 border-green-800 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-lg border border-teal-500 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  {blog.thumbnail && (
                    <img src={blog.thumbnail} alt={blog.title} className="w-full h-30 object-cover" />
                  )}
                  <div className="p-4 xs:p-5">
                    <h3 className="text-base xs:text-xl font-medium mb-2 text-black line-clamp-2">{blog.title}</h3>
                    <p className="text-gray-800 text-sm xs:text-base mb-4 line-clamp-3">{blog.content.slice(0, 150)}...</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-700 text-xs xs:text-sm px-2 py-1 rounded">
                          <i className="fi fi-rr-eye mr-1"></i> {blog.views || 0}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs xs:text-sm px-2 py-1 rounded">
                          <i className="fi fi-rr-comment mr-1"></i> {blog.comment_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/blogs/${blog.id}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-200">
                          <i className="fi fi-rr-eye text-xs"></i>
                        </Link>
                        <Link to={`/blogs/${blog.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors duration-200">
                          <i className="fi fi-rr-edit text-xs"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage