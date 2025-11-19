import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import ShareButton from './components/ShareButton';
import PostShareMeta from './components/PostShareMeta';

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ username: '', content: '', image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [newComment, setNewComment] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim() || !currentUser.trim()) return;

    const formData = new FormData();
    formData.append('username', currentUser);
    formData.append('content', newPost.content);
    
    if (newPost.image) {
      formData.append('image', newPost.image);
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      setPosts([data, ...posts]);
      setNewPost({ username: '', content: '', image: null });
      setPreviewImage(null);
      // Clear file input
      document.getElementById('image-upload').value = '';
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPost({ ...newPost, image: null });
    setPreviewImage(null);
    document.getElementById('image-upload').value = '';
  };

  // Handle adding a comment
  const handleAddComment = async (postId) => {
    if (!newComment[postId]?.trim() || !currentUser.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser,
          text: newComment[postId],
        }),
      });

      const data = await response.json();
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, data] } 
          : post
      ));
      
      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle liking a post
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: data.likes } 
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <HelmetProvider>
      <div className="app">
        <header className="app-header">
          <h1>Social Media App</h1>
          <div className="user-input">
            <input
              type="text"
              placeholder="Enter your username"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            />
          </div>
        </header>

        <main className="main-content">
          <div className="create-post">
            <h2>Create a Post</h2>
            <form onSubmit={handlePostSubmit}>
              <textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                disabled={!currentUser.trim()}
              />
              
              <div className="image-upload-container">
                <label htmlFor="image-upload" className="image-upload-label">
                  <span>Add Image</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={!currentUser.trim()}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                    <button type="button" onClick={removeImage} className="remove-image">
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={!newPost.content.trim() || !currentUser.trim()}
              >
                Post
              </button>
            </form>
          </div>

          <div className="posts">
            {posts.map((post) => (
              <div key={post.id} className="post">
                {post.id === selectedPost?.id && <PostShareMeta post={post} />}
                <div className="post-header">
                  <span className="username">@{post.username}</span>
                  <span className="post-time">{formatDate(post.createdAt)}</span>
                </div>
                <div className="post-content">{post.content}</div>
                {post.imageUrl && (
                  <div className="post-image">
                    <img 
                      src={`http://localhost:5000${post.imageUrl}`} 
                      alt="Post content" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="post-actions">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`like-button ${post.liked ? 'liked' : ''}`}
                  >
                    ❤️ {post.likes}
                  </button>
                  <ShareButton 
                    post={post} 
                    onShareClick={(post) => setSelectedPost(post)}
                  />
                </div>
                
                <div className="comments">
                  <h4>Comments ({post.comments?.length || 0})</h4>
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="comment">
                      <strong>@{comment.username}:</strong>
                      <span>{comment.text}</span>
                      <span className="comment-time">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  ))}
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => 
                        setNewComment({ ...newComment, [post.id]: e.target.value })
                      }
                      onKeyPress={(e) => 
                        e.key === 'Enter' && handleAddComment(post.id)
                      }
                      disabled={!currentUser.trim()}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment[post.id]?.trim() || !currentUser.trim()}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}

export default App;
