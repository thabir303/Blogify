import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'


const Header = () => {

  const navigate = useNavigate();

  // const userData = JSON.parse(localStorage.getItem('user_data'));
  const { userData, isLoggedin } = useContext(AppContext);

  const getstarted = () => {
    navigate('/blogs')
  };
  
  return (
    <div className='flex flex-col items-center mt-16 xs:mt-18 sm:mt-20 px-2 xs:px-3 sm:px-4 text-center
    text-gray-800'>
        <img src={assets.header_img} alt="" 
        className='w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 rounded-full mb-4 xs:mb-5 sm:mb-6' />
        <h1 className='flex items-center
        gap-1 xs:gap-1.5 sm:gap-2 text-lg xs:text-xl sm:text-2xl md:text-3xl'>
          Hey {userData ? userData.username : 'Developer'} 
          <img className='w-6 xs:w-7 sm:w-8 aspect-square' src={assets.hand_wave} alt="" />
        </h1>
        <h2 className='text-2xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 xs:mb-3 sm:mb-4'>Welcome to our app</h2>
        <p className='mb-5 xs:mb-6 sm:mb-8 max-w-xs xs:max-w-sm sm:max-w-md text-sm xs:text-base sm:text-base'>
          Let's start with a quick product tour and we will have you up and running in no time!
        </p>
        <button 
          onClick={getstarted} 
          className='border border-gray-300 rounded-full px-5 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-2.5
          text-sm xs:text-base sm:text-base transition-all duration-300 ease-in-out hover:shadow-md 
          hover:border-gray-400 hover:bg-white hover:scale-105'>
          Get Started
        </button>
    </div>
  )
}

export default Header