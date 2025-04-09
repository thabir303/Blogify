import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const navigate = useNavigate()
    const {userData, Logout} = useContext(AppContext)

    const handleLogout = () => {
      Logout();
      navigate('/');
    }
    return (
        <div className='w-full flex justify-between items-center p-3 sm:py-3 sm:px-6 md:px-12 lg:px-24 absolute top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50 transition-all duration-300'>
            <Link to="/" className="transition-transform duration-300 hover:scale-105">
                <img src={assets.blogify} className='w-14 sm:w-12 md:w-20' alt="Blogify Logo" />
            </Link> 

            {userData ? (
                <div className='flex items-center gap-3 sm:gap-5'>
                    <Link to="/blogs" className='transition-all duration-300 hover:translate-y-[-2px]'>
                        <button className="flex items-center gap-1 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-5 bg-indigo-600 text-white rounded-full hover:shadow-md hover:bg-indigo-700 transition-all duration-300">
                            <i className='fi fi-rr-file-edit flex items-center text-sm sm:text-base'>
                                <p className='ml-1 sm:ml-1.5 font-medium'>Write</p>
                            </i>
                        </button>
                    </Link>
                    
                    <div className='w-9 h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-full
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
                </div>
            ) : (
                <button 
                    onClick={() => navigate('/login')}
                    className='group flex items-center gap-1 sm:gap-2 border border-gray-300 
                    rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800
                    transition-all duration-300 ease-in-out w-24 sm:w-28 h-9 sm:h-11 justify-center
                    hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'
                >
                    <span className="font-medium">Login</span>
                    <img 
                        src={assets.arrow_icon} 
                        alt="" 
                        className='w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1' 
                    /> 
                </button>
            )}
        </div>
    )
}

export default Navbar