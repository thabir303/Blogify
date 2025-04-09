import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
// import CommentForm from './CommentForm';


const BlogDetail = () => {
 const { backendUrl } = useContext(AppContext);
 const { id } = useParams();
 const [blog, setBlog] = useState(null);
 const [comments, setComments] = useState([]);


 useEffect(() => {
   const fetchBlog = async () => {
     try {
       const accessToken = localStorage.getItem('access_token');
       const response = await axios.get(`${backendUrl}/blogs/${id}`, {
         headers: {
           Authorization: `Bearer ${accessToken}`,
         },
       });
       setBlog(response.data.blog);
       setComments(response.data.comments);
     } catch (error) {
       toast.error('Error fetching blog details');
     }
   };
   fetchBlog();
 }, [id, backendUrl]);


 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 py-6 px-8">
     {blog ? (
       <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-3xl font-semibold mb-4">{blog.title}</h2>
         <p className="text-gray-700 mb-4">{blog.content}</p>


         <div className="mt-6">
           <h3 className="text-xl font-semibold">Comments</h3>
           {/* <CommentForm blogId={id} /> */}
           <div className="mt-4">
             {comments.map((comment) => (
               <div key={comment.id} className="border-b py-2">
                 <p className="font-medium">{comment.user.username}:</p>
                 <p>{comment.content}</p>
               </div>
             ))}
           </div>
         </div>
       </div>
     ) : (
       <p>Loading blog...</p>
     )}
   </div>
 );
};


export default BlogDetail;