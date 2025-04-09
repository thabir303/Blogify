import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './pages/SignUp'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
// import CreateBlog from './pages/CreateBlog'

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path ='/' element={<Home/>} />
        <Route path ='/signup' element={<SignUp/>} />
        <Route path ='/login' element={<Login/>} />
        <Route path ='/blogs' element={<BlogList/>} />
        <Route path="/blogs/:id" element={<BlogDetail />} /> 
        {/* <Route path="/create-blog" element={<CreateBlog />} />  */}
        <Route path ='/activate-email' element={<EmailVerify/>} />
        <Route path ='/reset-password' element={<ResetPassword/>} />
        {/* <Route path ='/reset-password' element={<ResetPassword/>} /> */}

      </Routes>
    </div>
  )
}

export default App
