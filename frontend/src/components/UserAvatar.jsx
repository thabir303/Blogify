import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const UserAvatar = () => {
    const {userData, Logout} = useContext(AppContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => { 
            Logout();
        }, 10);
      };

    return (
        <div className='w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-full
             bg-black text-white relative group cursor-pointer 
            transition-all duration-300 hover:shadow-md hover:scale-105'>
            <span className='text-center text-xs xs:text-sm sm:text-base font-medium'>{userData.username[0].toUpperCase()}</span>
            <div className='absolute hidden group-hover:block top-0 right-0
            z-10 text-black rounded pt-8 xs:pt-10 sm:pt-12'>
            <ul className='list-none m-0 p-0 bg-white shadow-lg rounded-lg border 
            border-gray-100 overflow-hidden w-24 xs:w-28 sm:w-32'>
            <li onClick={() => navigate('/dashboard')}
            className='py-1.5 xs:py-2 sm:py-3 px-2 xs:px-3 sm:px-4 hover:bg-gray-50 
            cursor-pointer transition-colors duration-200 text-gray-700 flex items-center gap-1 xs:gap-2'
            >
             <span className="w-3 h-3 xs:w-4 xs:h-4 flex items-center m-1 p-1 border justify-center">
                <i className="fi fi-rr-dashboard text-xxs xs:text-xs "></i>
                </span>
                 <span className="text-xs xs:text-sm">Dashboard</span>
                 </li>
                        <li onClick={handleLogout} className='py-1.5 
                            xs:py-2 sm:py-3 px-2 xs:px-3 sm:px-4 hover:bg-gray-50 cursor-pointer 
                            transition-colors duration-200 text-gray-700 flex items-center gap-1 xs:gap-2 border-t 
                            border-gray-100'
                        >
                        <span className="w-3 h-3 xs:w-4 xs:h-4 flex items-center m-1 p-1 justify-center">
                            <i className="fi fi-rr-sign-out-alt text-xxs xs:text-xs"></i>
                        </span>
                        <span className="text-xs xs:text-sm">
                            Logout</span>
                        </li>
                            </ul>
                        </div>
                    </div>
                )
}

export default UserAvatar
