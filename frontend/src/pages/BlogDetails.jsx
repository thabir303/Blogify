import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FiArrowLeft, FiMessageSquare, FiSend, FiCornerDownRight } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';

const BlogDetails = () => {
  const { blog_id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userData, Logout } = useContext(AppContext);
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0); 
  const [showingLogout,setShowingLogout] = useState(false)
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        let response;
        if (userData) {
          const accessToken = localStorage.getItem('access_token');
          response = await apiClient.get(`${backendUrl}/blogs/${blog_id}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else {
          response = await apiClient.get(`${backendUrl}/blogs/${blog_id}/`);
        }
        
        if (response.data.success) {
          setBlog(response.data.blog);
          setComments(response.data.comments || []);
          
          let count = response.data.comments ? response.data.comments.length : 0;
          if (response.data.comments) {
            response.data.comments.forEach(comment => {
              if (comment.replies) {
                count += comment.replies.length;
              }
            });
          }
          setTotalCommentsCount(count);
        } else {
          setError('Failed to load blog');
        }
      } catch (error) {
        console.error('Error fetching blog details:', error);
        handleApiError(error, navigate)
        // setError('Failed to load blog. It might be deleted or you may not have permission to view it.');
      }
    };

    fetchBlogDetails();
    console.log(`id : ${blog_id}`);
    
   }, [backendUrl, blog_id, userData]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    if (!userData) {
      toast.info('You must be logged in to comment', {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await apiClient.post(
        `${backendUrl}/blogs/${blog_id}/comments/`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Comment added successfully');
        setCommentText('');
        setComments([
          ...comments,
          response.data.comment
        ]);
        setTotalCommentsCount(totalCommentsCount + 1);
      }
    } catch (error) {
    handleApiError(error, navigate)
    //   toast.error('Failed to post comment');
    } 
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    if (!userData) {
      toast.info('You must be logged in to reply', {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await apiClient.post(
        `${backendUrl}/comments/${replyingTo}/reply/`,
        { content: replyText },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Reply added successfully');
        setReplyText('');
        setReplyingTo(null);
        
        const updatedComments = comments.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data.reply]
            };
          }
          return comment;
        });
        
        setComments(updatedComments);
        setTotalCommentsCount(totalCommentsCount + 1);
      }
    } catch (error) {
        handleApiError(error, navigate)
    //   toast.error('Failed to post reply');
    }
  };

  const startReply = (commentId) => {
    if (!userData) {
      toast.info('You must be logged in to reply', {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    setReplyingTo(commentId);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const formatDateTime = (dateTimeString) => {
    return moment(dateTimeString).format('h:mm A [•] MMMM D, YYYY');
  };

  const isCurrentUser = (username) => {
    return userData && userData.username === username;
  };

  const displayAuthor = (username) => {
    return isCurrentUser(username) ? 'You' : username;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center">
        <div className="text-red-600 font-medium mb-4">{error}</div>
        <Link to="/blogs" className="text-indigo-600 hover:underline">
          Back to blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center">
        <div className="text-gray-600 font-medium mb-4">Blog not found</div>
        <Link to="/blogs" className="text-indigo-600 hover:underline">
          Back to blogs
        </Link>
      </div>
    );
  }

  const formatContent = (content) => {
    if (!content) return null;
    
    const paragraphs = content.split('\n');
    return paragraphs.map((paragraph, idx) => (
      paragraph ? 
        <p key={idx} className="mb-5 leading-relaxed text-gray-700 text-lg">
          {paragraph}
        </p> 
        :  <br key={idx} /> ));
    };

  const handleLogout = () => {
    Logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className='w-full flex justify-between items-center p-2 sm:py-1 sm:px-4 md:px-4 lg:px-16
      z-50 transition-all duration-300'>
        <Link to="/" className="transition-transform duration-300 hover:scale-105">
          <img src={assets.blogify} className='w-14 sm:w-12 md:w-20' alt="Blogify Logo" />
        </Link>
          
        {userData ? (
          <div className='w-8 h-8 sm:w-9 sm:h-9 flex justify-center items-center rounded-full
          bg-black text-white relative group cursor-pointer
          transition-all duration-300 hover:shadow-md hover:scale-105'>
          <span className='text-center font-medium'>{userData.username[0].toUpperCase()}</span>
          <div className='absolute hidden group-hover:block top-0 right-0
          z-10 text-black rounded pt-10 sm:pt-12'>
              <ul className='list-none m-0 p-0 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden w-28 sm:w-32'>
                  <li
                      onClick={handleLogout}  
                      className='py-2 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 text-gray-700 flex items-center gap-2'
                  >
                      <span className="w-4 h-4 flex items-center justify-center">
                          <i className="fi fi-rr-sign-out text-xs"></i>
                      </span>
                      <span>Logout</span>
                  </li>
              </ul>
          </div>
      </div> 
            ) 
            : (
          <button onClick={() => navigate('/login')}
            className='group flex items-center gap-1 border border-black bg-white
              rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800
              transition-all duration-300 ease-in-out w-20 sm:w-24 h-8 sm:h-10 justify-center
              hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'>
            <span className="font-medium">Login</span>
            <img src={assets.arrow_icon} alt=""
              className='w-2.5 sm:w-3 h-2.5 sm:h-3 transition-transform duration-300 group-hover:translate-x-1'
            />
          </button>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link to="/blogs" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <FiArrowLeft />
            <span>Back to blogs</span>
          </Link>
          
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {blog.status === 'published' ? (
              <img src="/world.png" alt="Published" className="w-3 h-3" /> ) 
              : (
              <img src="/drafts (1).png" alt="Drafted" className="w-3 h-3" />
            )}
            {blog.status === 'published' ? 'Published' : 'Draft'}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center text-gray-600 text-sm mb-5">
              <span className="font-medium">By {isCurrentUser(blog.author) ? 'You' : blog.author}</span>
              <span className="mx-2">•</span>
              <span>{formatDateTime(blog.created_at)}</span>
              {blog.updated_at !== blog.created_at && (
                <>
                  <span className="mx-2">•</span>
                  <span>Updated {moment(blog.updated_at).fromNow()}</span>
                </>
              )}
            </div>
            <div className="prose max-w-none">
              {formatContent(blog.content)}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiMessageSquare />
              Comments ({totalCommentsCount})
            </h2>
            
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center 
                  ${userData ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {userData ? (
                    userData.username[0].toUpperCase()
                  ) : (
                    <FiMessageSquare size={14} />
                  )}
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={userData ? "Add a comment..." : "Login to comment"}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    disabled={!userData || submitting}
                  />
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!userData || submitting}
                      onClick={handleCommentSubmit}
                      className={`flex items-center gap-1 py-2 px-4 rounded-lg font-medium
                        ${userData 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <FiSend size={16} />
                      <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-medium text-sm">
                          {comment.username[0].toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">{displayAuthor(comment.username)}</span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        
                        <div className="text-gray-700 mb-2">
                          {comment.content.split('\n').map((paragraph, idx) => (
                            paragraph ? <p key={idx} className="mb-1">{paragraph}</p> : <br key={idx} />
                          ))}
                        </div>
                        
                        {replyingTo !== comment.id && (
                          <button
                            onClick={() => startReply(comment.id)}
                            className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-800"
                          >
                            <FiCornerDownRight size={14} />
                            <span>Reply</span>
                          </button>
                        )}
                        
                        {replyingTo === comment.id && (
                          <form onSubmit={handleReplySubmit} className="mt-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              rows="2"
                              disabled={submitting}
                            />
                            
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelReply}
                                className="py-1.5 px-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              
                              <button
                                type="submit"
                                disabled={submitting}
                                className="py-1.5 px-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 flex items-center gap-1"
                              >
                                <FiSend size={14} />
                                <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
                              </button>
                            </div>
                          </form>
                        )}
                        
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-100">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <div className="w-6 h-6 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-700 font-medium text-xs">
                                    {reply.username[0].toUpperCase()}
                                  </span>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-800 text-sm">{displayAuthor(reply.username)}</span>
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(reply.created_at)}
                                    </span>
                                  </div>
                                  
                                  <div className="text-gray-700 text-sm">
                                    {reply.content.split('\n').map((paragraph, idx) => (
                                      paragraph ? <p key={idx} className="mb-1">{paragraph}</p> : <br key={idx} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;