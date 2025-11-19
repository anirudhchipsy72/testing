import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  // Use the server-rendered URL for sharing
  const postUrl = `https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app/post/${post.id}`;
  
  // Construct the full image URL
  let imageUrl = '';
  if (post.imageUrl) {
    if (post.imageUrl.startsWith('http')) {
      imageUrl = post.imageUrl;
    } else {
      imageUrl = `https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`;
    }
  }

  const title = `Post by ${post.username}`;
  const description = post.content && post.content.length > 100 
    ? `${post.content.substring(0, 100)}...` 
    : post.content || 'Check out this post';

  return (
    <Helmet>
      {/* Standard meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={postUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:url" content={postUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      
      {/* Image meta tags */}
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:secure_url" content={imageUrl} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={`Image shared by ${post.username}`} />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={imageUrl} />
          <meta name="twitter:image:src" content={imageUrl} />
          <meta name="twitter:image:alt" content={`Image shared by ${post.username}`} />
        </>
      )}
      
      {/* Additional WhatsApp specific tags */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="Social Media App" />
      
      {/* Cache busting */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
    </Helmet>
  );
}
