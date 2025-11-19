import { Helmet } from 'react-helmet-async';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  // Use the correct domain based on environment
  const domain = window.location.origin;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Construct the full image URL
  let imageUrl = '';
  if (post.imageUrl) {
    if (post.imageUrl.startsWith('http')) {
      imageUrl = post.imageUrl;
    } else {
      // For local development, use localhost:5000 for the backend
      const baseUrl = isProduction 
        ? domain 
        : 'http://localhost:5000';
      imageUrl = `${baseUrl}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`;
    }
  }

  // Construct the post URL with a timestamp to prevent caching
  const postUrl = `${domain}/post/${post.id}?v=${new Date().getTime()}`;
  
  // Create title and description
  const title = `Post by ${post.username}`;
  const description = post.content.length > 100 
    ? `${post.content.substring(0, 100)}...` 
    : post.content;

  // WhatsApp requires specific image dimensions and format
  const imageMeta = imageUrl ? (
    <>
      {/* Open Graph / Facebook */}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`Image shared by ${post.username}`} />
      
      {/* Additional WhatsApp specific tags */}
      <meta property="og:image:url" content={imageUrl} />
      <meta property="og:image:secure" content="true" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:src" content={imageUrl} />
      <meta name="twitter:image:alt" content={`Image shared by ${post.username}`} />
    </>
  ) : (
    <meta name="twitter:card" content="summary" />
  );

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
      {imageMeta}
      
      {/* Additional WhatsApp specific tags */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* Cache busting for WhatsApp */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      
      {/* Additional WhatsApp specific */}
      <meta property="og:determiner" content="the" />
      <meta property="og:see_also" content={domain} />
      <meta property="article:author" content={post.username} />
      <meta property="article:published_time" content={post.createdAt || new Date().toISOString()} />
    </Helmet>
  );
}
