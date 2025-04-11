import React from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import UserAvatar from './UserAvatar'
import BlogifyLogo from './BlogifyLogo'
import Read from './Read'
import LoginButton from './LoginButton'

const Navbar = ({ transparent = false }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const {userData} = useContext(AppContext)

    const isHome = location.pathname ==='/'

    return (
        <div className={`w-full flex justify-between items-center p-2 xs:p-3 sm:py-3 sm:px-6 md:px-12 lg:px-24 
            fixed top-0 bg-transparent shadow-sm z-50 transition-all duration-300`}>
            <BlogifyLogo/>

            {userData ? (
                   <div className='flex items-center gap-2 xs:gap-3 sm:gap-5'>
                    {isHome ? (
                        <Read/>
                    ) : null}
                    
                    <UserAvatar/>
                </div>
            ) : (
                <div className='flex items-center gap-2 xs:gap-3 sm:gap-4'>
                    {isHome && (
                        <Read/>
                    )}
                    
                    <LoginButton/>
                </div>
            )}
        </div>
    )
}

export default Navbar