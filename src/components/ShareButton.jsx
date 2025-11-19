import { FaShare, FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './ShareButton.css';

export default function ShareButton({ post, onShareClick }) {
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);
  
  useEffect(() => {
    // Check if Web Share API is supported
    setIsNativeShareSupported(!!navigator.share);
  }, []);

  const handleShare = async (e) => {
    e.stopPropagation();
    
    // Call the parent's onShareClick to update the selected post
    if (onShareClick) {
      onShareClick(post);
    }
    
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Post by ${post.username}`,
      text: post.content.length > 100 
        ? `${post.content.substring(0, 100)}...` 
        : post.content,
      url: postUrl,
    };

    try {
      if (isNativeShareSupported) {
        await navigator.share(shareData);
      } else {
        // Fallback for WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        )}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare} 
      className="share-button" 
      aria-label="Share post" 
      title="Share this post"
    >
      {isNativeShareSupported ? (
        <FaShare className="share-icon" />
      ) : (
        <FaWhatsapp className="whatsapp-icon" />
      )}
      <span>Share</span>
    </button>
  );
}
