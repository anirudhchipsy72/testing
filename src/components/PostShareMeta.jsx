import { Helmet } from 'react-helmet-async';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://testing-lfj5h1af2-yoyomaster12s-projects.vercel.app' 
    : 'http://localhost:5000';
    
  const postUrl = `${isProduction ? 'https://testing-lfj5h1af2-yoyomaster12s-projects.vercel.app' : window.location.origin}/post/${post.id}`;
  const imageUrl = post.imageUrl 
    ? post.imageUrl.startsWith('http')
      ? post.imageUrl
      : `${baseUrl}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`
    : null;
    
  const title = `Post by ${post.username}`;
  const description = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={postUrl} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Social Media App" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      
      {/* Additional meta tags for better sharing */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {imageUrl && <meta property="og:image:secure_url" content={imageUrl} />}
    </Helmet>
  );
}
