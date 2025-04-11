import React from 'react'
import { Link } from 'react-router-dom';

const Read = () => {
  return (
    <div>
      <Link to="/blogs" className='transition-all duration-300 hover:translate-y-[-2px]'>
                            <button className="flex items-center gap-1 sm:gap-2 py-1.5 px-2 xs:py-2 xs:px-3 sm:py-2.5 sm:px-5 bg-indigo-600 text-white rounded-full hover:shadow-md hover:bg-indigo-700 transition-all duration-300">
                                <i className='fi fi-rr-book-alt flex items-center text-xs xs:text-sm sm:text-base'>
                                    <p className='ml-0.5 xs:ml-1 sm:ml-1.5 text-xs xs:text-sm sm:text-base font-medium'>Read</p>
                                </i>
                            </button>
     </Link>
    </div>
  )
}

export default Read
