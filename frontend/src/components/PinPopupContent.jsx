import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';


function PinPopupContent({ pin, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pins/${pin.pin_id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data || []);
    } catch (error) {
      console.error(`Error fetching comments for pin ${pin.pin_id}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [pin.pin_id]);


  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const payload = {
      user_id: currentUser.userId,
      username: currentUser.username,
      comment_text: newComment,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/pins/${pin.pin_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      
      setNewComment('');
      fetchComments(); 
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Could not post comment.');
    }
  };

  return (
    <div className="w-64 p-1">
      {/* Pin Details */}
      <h3 className="font-bold text-lg text-gray-800 mb-1 break-words">{pin.title}</h3>
      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap break-words">{pin.message}</p>
      <hr className="my-2"/>
      
      {/* Comments Section */}
      <h4 className="font-semibold text-gray-700 mb-2">Comments</h4>
      
      {/* Comment Form */}
      <form onSubmit={handlePostComment} className="flex gap-2 mb-3">
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Post</button>
      </form>
      
      {/* Comments List */}
      <div className="max-h-40 overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.comment_id} className="text-sm mb-2 border-b border-gray-100 pb-2">
              <p className="font-semibold text-gray-800">{comment.username}</p>
              <p className="text-gray-600 break-words">{comment.comment_text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

export default PinPopupContent;
