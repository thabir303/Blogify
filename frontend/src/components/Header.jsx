import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'


const Header = () => {

  const navigate = useNavigate();

  // const userData = JSON.parse(localStorage.getItem('user_data'));
  const { userData,isLoggedin } = useContext(AppContext);

  const getstarted = () => {
    navigate('/blogs')
  };
  
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center
    text-gray-800'>
        <img src={assets.header_img} alt="" 
        className='w-35 h-36 rounded-full mb-6' />
        <h1 className='flex items-center
        gap-2 text-xl sm:text-3xl'>Hey {userData ? userData.username : 'Developer'} <img className='w-8 aspect-square' src={assets.hand_wave} alt="" /></h1>
        <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our app</h2>
        <p className='mb-8 max-w-md'> Let's start with a quick product tour and we will have you up and running in no time!</p>
        <button onClick={getstarted} className='border border-gray-300 rounded-full px-8 py-2.5
        transition-all duration-300 ease-in-out hover:shadow-md 
        hover:border-gray-400 hover:bg-white hover:scale-105'>Get Started</button>
    </div>
  )
}

export default Header