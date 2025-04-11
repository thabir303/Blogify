import React from 'react'
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const BlogifyLogo = () => {
  return (
    <div>
      <Link to="/" className="transition-transform duration-300 hover:scale-105">
          <img src={assets.blogify} className="w-14 sm:w-12 md:w-20" alt="Blogify Logo" />
        </Link>
    </div>
  )
}

export default BlogifyLogo
