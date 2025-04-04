import React, { use, useContext } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const EmailVerify = () => {
  
  axios.defaults.withCredentials = true;
  const {backendUrl,isLoggedin, userData} = useContext(AppContext)
  const inputRefs = React.useRef([])

  const navigate = useNavigate();

  const handleInput = (e,index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e,index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
      }
    })
  }

  const submitHandler = async (e) => {
    try {
      e.preventDefault();

      const userData = JSON.parse(localStorage.getItem('user_data'));

      if(!userData || !userData.email){
        toast.error('User is undefined or email not found');
        return;
      }

      const email = userData.email;
      const otpArray = inputRefs.current.map(e=> e.value)
      const pin = otpArray.join('')

      const {data} = await axios.post(backendUrl + '/auth/activate/',{email,pin})

      if(data.success){
        toast.success(data.message)
        userData,
        navigate('/login')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message)
    }
    
    
  }

  return (
    <div className='flex items-center justify-center min-h-screen 
     bg-gradient-to-br from-blue-200 to-purple-400'>
       <img onClick={()=>navigate('/')} src={assets.logo} alt="" 
       className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
       <form onSubmit={submitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Activate your account 
        </h1>
        <p className='text-center mb-6 text-indigo-300'>
          Enter the 6-digit code sent to your email address.
        </p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength='1' key={index} required
              className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl 
              rounded-md'
              ref={ e => inputRefs.current[index] = e}
              onInput={(e) => handleInput(e,index)}
              onKeyDown={(e) => handleKeyDown(e,index)}

              />
            ))}
          </div>
          <button className='w-full py-3 bg-gradient-to-r from-indigo-500
          to-indigo-900 text-white rounded-full'>Activate Email</button>
       </form>
    </div>
  )
}

export default EmailVerify
