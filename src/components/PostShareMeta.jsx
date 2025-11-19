import { Helmet } from 'react-helmet-async';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  // Use post content for title (first 60 chars) or fallback
  const title = post.content 
    ? `${post.content.substring(0, 60)}${post.content.length > 60 ? '...' : ''}`
    : 'Social Media App';
    
  // Use post content as description or fallback
  const description = post.content || 'A modern social media platform to connect and share with friends';
  
  // Construct image URL - use post image if available, otherwise fallback to default
  let imageUrl = '';
  if (post.imageUrl) {
    imageUrl = post.imageUrl.startsWith('http') 
      ? post.imageUrl 
      : `https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`;
  } else {
    imageUrl = 'https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app/social-preview.jpg';
  }

  const pageUrl = `https://testing-j9ds6pdvz-yoyomaster12s-projects.vercel.app/post/${post.id}`;
  const imageAlt = post.username 
    ? `Image shared by ${post.username}`
    : 'Social Media Post';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="Social Media App" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:src" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      
      {/* Additional WhatsApp specific tags */}
      <meta property="og:site_name" content="Social Media App" />
    </Helmet>
  );
}
