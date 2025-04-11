import React from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const {userData, Logout} = useContext(AppContext)

    const handleLogout = () => {
      Logout();
      navigate('/');
    }

    const isHome = location.pathname ==='/'

    return (
        <div className='w-full flex justify-between items-center p-2 xs:p-3 sm:py-3 sm:px-6 md:px-12 lg:px-24 absolute top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50 transition-all duration-300'>
            <Link to="/" className="transition-transform duration-300 hover:scale-105">
                <img src={assets.blogify} className='w-10 xs:w-14 sm:w-12 md:w-16 lg:w-20' alt="Blogify Logo" />
            </Link> 

            {userData ? (
                   <div className='flex items-center gap-2 xs:gap-3 sm:gap-5'>
                    {isHome ? (
                        <Link to="/blogs" className='transition-all duration-300 hover:translate-y-[-2px]'>
                            <button className="flex items-center gap-1 sm:gap-2 py-1.5 px-2 xs:py-2 xs:px-3 sm:py-2.5 sm:px-5 bg-indigo-600 text-white rounded-full hover:shadow-md hover:bg-indigo-700 transition-all duration-300">
                                <i className='fi fi-rr-book-alt flex items-center text-xs xs:text-sm sm:text-base'>
                                    <p className='ml-0.5 xs:ml-1 sm:ml-1.5 text-xs xs:text-sm sm:text-base font-medium'>Read</p>
                                </i>
                            </button>
                        </Link>
                    ) : null}
                    
                    <div className='w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-full
                    bg-black text-white relative group cursor-pointer 
                    transition-all duration-300 hover:shadow-md hover:scale-105'>
                        <span className='text-center text-xs xs:text-sm sm:text-base font-medium'>{userData.username[0].toUpperCase()}</span>
                        <div className='absolute hidden group-hover:block top-0 right-0
                        z-10 text-black rounded pt-8 xs:pt-10 sm:pt-12'>
                            <ul className='list-none m-0 p-0 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden w-24 xs:w-28 sm:w-32'>
                                <li
                                    onClick={handleLogout}  
                                    className='py-1.5 xs:py-2 sm:py-3 px-2 xs:px-3 sm:px-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 text-gray-700 flex items-center gap-1 xs:gap-2'
                                >
                                    <span className="w-3 h-3 xs:w-4 xs:h-4 flex items-center justify-center">
                                        <i className="fi fi-rr-sign-out text-xxs xs:text-xs"></i>
                                    </span>
                                    <span className="text-xs xs:text-sm">Logout</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex items-center gap-2 xs:gap-3 sm:gap-4'>
                    {isHome && (
                        <Link to="/blogs" className='transition-all duration-300 hover:translate-y-[-2px]'>
                            <button className="flex items-center gap-1 sm:gap-2 py-1.5 px-2 xs:py-2 xs:px-3 sm:py-2.5 sm:px-5 bg-indigo-600 text-white rounded-full hover:shadow-md hover:bg-indigo-700 transition-all duration-300">
                                <i className='fi fi-rr-book-alt flex items-center text-xs xs:text-sm sm:text-base'>
                                    <p className='ml-0.5 xs:ml-1 sm:ml-1.5 text-xs xs:text-sm sm:text-base font-medium'>Read</p>
                                </i>
                            </button>
                        </Link>
                    )}
                    
                    <button
                        onClick={() => navigate('/login')}
                        className='group flex items-center gap-0.5 xs:gap-1 sm:gap-2 border border-black bg-white
                        rounded-full px-2 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800
                        transition-all duration-300 ease-in-out w-20 xs:w-24 sm:w-28 h-7 xs:h-9 sm:h-11 justify-center
                        hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'
                    >
                        <span className="text-xs xs:text-sm sm:text-base font-medium">Login</span>
                        <img
                            src={assets.arrow_icon}
                            alt=""
                            className='w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1'
                        />
                    </button>
                </div>
            )}
        </div>
    )
}

export default Navbar