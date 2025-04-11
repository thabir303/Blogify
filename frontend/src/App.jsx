//App.jsx
import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ForgetPassword'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './pages/SignUp'
import BlogList from './pages/BlogList'
import BlogDetails from './pages/BlogDetails'
import CreateBlog from './pages/CreateBlog'
import BlogEdit from './pages/BlogEdit'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorPage from './components/ErrorPage'

const App = () => {
  
  const location = useLocation();
  const errorState = location.state?.errorStatus ? {
    statusCode: location.state.errorStatus,
    message: location.state.errorMessage
  } : null;

  return (
    <div>
      <ToastContainer position='top-right' autoClose={3000}/>
      <ErrorBoundary>
      <Routes>
        <Route path ='/' element={<Home/>} />
        <Route path ='/signup' element={<SignUp/>} />
        <Route path ='/login' element={<Login/>} />
        <Route path ='/blogs' element={<BlogList/>} />
        <Route path="/blogs/:blog_id" element={<BlogDetails />} /> 
        <Route path ='/activate-email' element={<EmailVerify/>} />
        <Route path ='/forgot-password' element={<ResetPassword/>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/create-blog" element={<CreateBlog />} /> 
          <Route path="/blogs/:blog_id/edit" element={<BlogEdit />} /> 
        </Route>

        <Route path ='/not-found' element={
          <ErrorPage statusCode={404}
          message="The page you are looking for does not exist." />
        } />

        <Route path ='/server-error' element={
          <ErrorPage statusCode={500}
          message="Server error. Please try again later." />
        } />
        <Route path="/unauthorized" element={
            <ErrorPage 
              statusCode={401} 
              message="You need to be logged in to access this page."
              redirectPath="/login"
            />
          } />
        <Route path="/forbidden" element={
            <ErrorPage 
              statusCode={403} 
              message="You do not have permission to access this resource."
            />
          } />

          {errorState && (
            <Route path="/error"  element={
                <ErrorPage  statusCode={errorState.statusCode} 
                  message={errorState.message}
                />
              } 
            />
          )}

          <Route path="*" element={<Navigate to="/not-found" replace />} />

      </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App