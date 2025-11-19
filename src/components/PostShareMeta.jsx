import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  // Log the post data for debugging
  useEffect(() => {
    console.log('Post data in PostShareMeta:', post);
  }, [post]);

  // Use the correct domain based on environment
  const domain = 'https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app';
  
  // Construct the full image URL - ensure it's absolute
  let imageUrl = '';
  if (post.imageUrl) {
    if (post.imageUrl.startsWith('http')) {
      imageUrl = post.imageUrl;
    } else if (post.imageUrl.startsWith('/')) {
      imageUrl = `${domain}${post.imageUrl}`;
    } else {
      imageUrl = `${domain}/${post.imageUrl}`;
    }
  }

  // Construct the post URL with a timestamp to prevent caching
  const postUrl = `${domain}/post/${post.id}?v=${new Date().getTime()}`;
  
  // Create title and description
  const title = `Post by ${post.username}`;
  const description = post.content && post.content.length > 100 
    ? `${post.content.substring(0, 100)}...` 
    : post.content || 'Check out this post';

  // Log the generated URLs for debugging
  useEffect(() => {
    console.log('Generated image URL:', imageUrl);
    console.log('Generated post URL:', postUrl);
  }, [imageUrl, postUrl]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={postUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Social Media App" />
      
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
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* Cache busting */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      
      {/* Additional meta tags */}
      <meta property="og:determiner" content="the" />
      <meta property="og:see_also" content={domain} />
      <meta property="article:author" content={post.username} />
      <meta property="article:published_time" content={post.createdAt || new Date().toISOString()} />
    </Helmet>
  );
}
