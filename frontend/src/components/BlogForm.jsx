import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSave, FiEye, FiFileText } from 'react-icons/fi';

const BlogForm = ({ 
  formData,
  onChange,
  onStatusChange,
  onSubmit,
  loading,
  initialStatus,
  isEditMode = false,
  cancelUrl = "/blogs"
}) => {
  const [preview, setPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      [name]: value
    });
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Blog' : 'Create New Blog'}
        </h1>
        
        <button onClick={togglePreview}
          className="flex items-center gap-1 py-1.5 px-3 sm:py-2 sm:px-4
            bg-white border border-indigo-300 text-indigo-600 rounded-full 
            hover:shadow-md hover:bg-indigo-50 transition-all duration-300" >
          {preview ? (
            <>
              <FiFileText className="text-indigo-600" />
              <span className="font-medium">Edit</span>
            </>
          ) : (
            <>
              <FiEye className="text-indigo-600" />
              <span className="font-medium">Preview</span>
            </>
          )}
        </button>
      </div>
      
      {preview ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">{formData.title || 'Untitled Blog'}</h2>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-4 
            ${formData.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
          >
            {formData.status === 'published' ? (
              <img src="/world.png" alt="Published" className="w-3 h-3" />
            ) : (
              <img src="/drafts (1).png" alt="Drafted" className="w-3 h-3" />
            )}
            {formData.status === 'published' ? 'Published' : 'Draft'}
          </div>
          <div className="prose max-w-none">
            {formData.content.split('\n').map((paragraph, idx) => (
              paragraph ? <p key={idx} className="mb-4">{paragraph}</p> : <br key={idx} />
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
              Title
            </label>
            <input type="text" id="title" name="title" value={formData.title}
              onChange={handleChange} placeholder="Enter blog title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-1">
              Content
            </label>
            <textarea id="content" name="content" value={formData.content} onChange={handleChange}
              placeholder="Write your blog content here..."
              rows="12"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <button type="button" onClick={() => onStatusChange('draft')}
                disabled={isEditMode && initialStatus === 'published'}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2
                  ${isEditMode && initialStatus === 'published' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70' 
                    : formData.status === 'draft' 
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                      : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`}
              >
                <img src="/drafts (1).png" alt="Draft" className="w-4 h-4" />
                <span>Save as Draft</span>
              </button>
              
              <button type="button" onClick={() => onStatusChange('published')}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2
                  ${formData.status === 'published' 
                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`}
              >
                <img src="/world.png" alt="Published" className="w-4 h-4" />
                <span>Publish</span>
              </button>
            </div>
            {isEditMode && initialStatus === 'published' && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Published blogs cannot be changed back to draft status
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <Link to={cancelUrl}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FiSave />
                  <span>{isEditMode ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default BlogForm;