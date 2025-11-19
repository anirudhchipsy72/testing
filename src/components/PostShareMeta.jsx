import { Helmet } from 'react-helmet-async';

export default function PostShareMeta({ post }) {
  if (!post) return null;

  const postUrl = `${window.location.origin}/post/${post.id}`;
  const imageUrl = post.imageUrl ? `${window.location.origin}${post.imageUrl}` : null;
  const title = `Post by ${post.username}`;
  const description = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <Helmet>
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
    </Helmet>
  );
}
