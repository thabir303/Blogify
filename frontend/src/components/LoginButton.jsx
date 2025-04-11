import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const LoginButton = () => {

    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => navigate('/login')}
                                    className={`group flex items-center gap-0.5 xs:gap-1 sm:gap-2 border 
                                    border-black bg-transparent
                                    rounded-full px-2 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2.5 text-gray-800
                                    transition-all duration-300 ease-in-out w-20 xs:w-24 sm:w-28 h-7 xs:h-9 sm:h-11 justify-center
                                    hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600`}
                                >
                                    <span className="text-xs xs:text-sm sm:text-base font-medium">Login</span>
                                    <img src={assets.arrow_icon}  alt="right_arrow"
                                        className='w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1'
                                    />
            </button>
        </div>
    )
}

export default LoginButton
