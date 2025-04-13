import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FiArrowLeft, FiMessageSquare, FiSend, FiCornerDownRight, FiEdit } from 'react-icons/fi';
import { assets } from '../assets/assets';
import apiClient, { handleApiError } from '../utils/apiClient';
import UserAvatar from '../components/UserAvatar';
import BlogifyLogo from '../components/BlogifyLogo';

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
          response = await axios.get(`${backendUrl}/api/blogs/${blog_id}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else {
          response = await axios.get(`${backendUrl}/api/blogs/${blog_id}/`);
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
        setError('Failed to load blog. It might be deleted or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
    console.log(`id : ${blog_id}`);
    
   }, [backendUrl, blog_id, userData]);

  const redirectToLoginWithReturnUrl = () => {
    localStorage.setItem('returnUrl', `/blogs/${blog_id}`);
    
    toast.info('You must be logged in to continue', {
      autoClose: 2000,
    });
    
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (blog.status !== 'published') {
      toast.error('Comments are not allowed on draft blogs');
      return;
    }
    
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    if (!userData) {
      redirectToLoginWithReturnUrl();
      return;
    }
    
    setSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(
        `${backendUrl}/api/blogs/${blog_id}/comments/`,
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
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (blog.status !== 'published') {
      toast.error('Comments are not allowed on draft blogs');
      return;
    }
    
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    if (!userData) {
      redirectToLoginWithReturnUrl();
      return;
    }
    
    setSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.post(
        `${backendUrl}/api/comments/${replyingTo}/reply/`,
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
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (commentId) => {
    if (blog.status !== 'published') {
      toast.error('Comments are not allowed on draft blogs');
      return;
    }
    
    if (!userData) {
      redirectToLoginWithReturnUrl();
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

  const handleEditClick = () => {
    navigate(`/blogs/${blog_id}/edit`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center p-4">
        <div className="text-red-600 font-medium mb-4 text-center">{error}</div>
        <Link to="/blogs" className="text-indigo-600 hover:underline">
          Back to blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center p-4">
        <div className="text-gray-600 font-medium mb-4 text-center">Blog not found</div>
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
        <p key={idx} className="mb-5 leading-relaxed text-gray-700 text-base sm:text-lg">
          {paragraph}
        </p> 
        :  <br key={idx} /> ));
    };

  const handleLogout = () => {
    Logout();
    navigate('/');
  };

  const isAuthor = isCurrentUser(blog.author);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className='w-full flex justify-between items-center p-2 sm:py-1 sm:px-4 md:px-6 lg:px-16
      z-50 transition-all duration-300'>
                <BlogifyLogo/>

          
        {userData ? (
            // <>Abir</>
          <UserAvatar/>
        ) 
        : (
          <button onClick={() => navigate('/login')}
            className='group flex items-center gap-1 border border-black bg-white
              rounded-full px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 text-xs md:text-sm text-gray-800
              transition-all duration-300 ease-in-out w-16 sm:w-20 md:w-24 h-7 sm:h-8 md:h-9 lg:h-10 justify-center
              hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'>
            <span className="font-medium">Login</span>
            <img src={assets.arrow_icon} alt=""
              className='w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 transition-transform duration-300 group-hover:translate-x-1'
            />
          </button>
        )}
      </div>
      
      <div className="max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <Link to="/blogs" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs sm:text-sm md:text-base">
            <FiArrowLeft size={12} className="sm:text-base md:text-lg" />
            <span>Back to blogs</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {blog.status === 'draft' && isAuthor && (
              <button 
                onClick={handleEditClick}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"
              >
                <FiEdit size={12} className="sm:text-base" />
                <span>Edit</span>
              </button>
            )}
            
            <div className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium
              ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {blog.status === 'published' ? (
                <img src="/world.png" alt="Published" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> ) 
                : (
                <img src="/drafts (1).png" alt="Drafted" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span className="text-xs">{blog.status === 'published' ? 'Published' : 'Draft'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5">
              <span className="font-medium">By {isCurrentUser(blog.author) ? 'You' : blog.author}</span>
              <span className="mx-1 sm:mx-2">•</span>
              <span>{formatDateTime(blog.created_at)}</span>
              {blog.updated_at !== blog.created_at && (
                <>
                  <span className="mx-1 sm:mx-2">•</span>
                  <span>Updated {moment(blog.updated_at).fromNow()}</span>
                </>
              )}
            </div>
            <div className="prose max-w-none">
              {formatContent(blog.content)}
            </div>
          </div>
        </div>
        
        {blog.status === 'published' ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                <FiMessageSquare size={16} className="sm:text-lg md:text-xl" />
                <span>Comments ({totalCommentsCount})</span>
              </h2>
              
              <form onSubmit={handleCommentSubmit} className="mb-6 sm:mb-8">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0 rounded-full flex items-center justify-center 
                    ${userData ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {userData ? (
                      <span className="text-xs sm:text-sm">{userData.username[0].toUpperCase()}</span>
                    ) : (
                      <FiMessageSquare size={12} className="sm:text-sm" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      placeholder={userData ? "Add a comment..." : "Login to comment"}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      rows="3" disabled={!userData || submitting}
                    />
                    
                    <div className="flex justify-end">
                      <button type="submit" disabled={!userData || submitting}
                        onClick={handleCommentSubmit}
                        className={`flex items-center gap-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm
                          ${userData 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        <FiSend size={14} className="sm:text-base" />
                        <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              
              {comments.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-3 sm:pb-4 mb-3 sm:mb-4 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-medium text-xs sm:text-sm">
                            {comment.username[0].toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">{displayAuthor(comment.username)}</span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                          
                          <div className="text-gray-700 mb-2 text-xs sm:text-sm md:text-base">
                            {comment.content.split('\n').map((paragraph, idx) => (
                              paragraph ? <p key={idx} className="mb-1">{paragraph}</p> : <br key={idx} />
                            ))}
                          </div>
                          
                          {replyingTo !== comment.id && (
                            <button
                              onClick={() => startReply(comment.id)}
                              className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-0.5 sm:gap-1 hover:text-indigo-800"
                            >
                              <FiCornerDownRight size={12} className="sm:text-sm" />
                              <span>Reply</span>
                            </button>
                          )}
                          
                          {replyingTo === comment.id && (
                            <form onSubmit={handleReplySubmit} className="mt-2 sm:mt-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                                rows="2"
                                disabled={submitting}
                              />
                              
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={cancelReply}
                                  className="py-1 sm:py-1.5 px-2 sm:px-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-xs sm:text-sm">
                                  Cancel
                                </button>
                                
                                <button type="submit" disabled={submitting}
                                  className="py-1 sm:py-1.5 px-2 sm:px-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 flex items-center gap-1 text-xs sm:text-sm"
                                >
                                  <FiSend size={12} className="sm:text-sm" />
                                  <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
                                </button>
                              </div>
                            </form>
                          )}
                          
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 sm:mt-3 space-y-3 sm:space-y-4 pl-3 sm:pl-4 border-l-2 border-gray-100">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2 sm:gap-3">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-700 font-medium text-xs">
                                      {reply.username[0].toUpperCase()}
                                    </span>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                      <span className="font-medium text-gray-800 text-xs sm:text-sm">{displayAuthor(reply.username)}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(reply.created_at)}
                                      </span>
                                    </div>
                                    
                                    <div className="text-gray-700 text-xs sm:text-sm">
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
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
                <FiMessageSquare size={16} className="sm:text-lg md:text-xl" />
                <span>Comments</span>
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Comments are disabled for draft blogs. Publish your blog to enable comments.
              </p>
              {isAuthor && (
                <button  onClick={handleEditClick}
                  className="mt-3 sm:mt-4 flex items-center gap-1 bg-indigo-600
                text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 mx-auto text-xs sm:text-sm"
                >
                  <FiEdit size={14} className="sm:text-base" />
                  <span>Edit Blog</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;