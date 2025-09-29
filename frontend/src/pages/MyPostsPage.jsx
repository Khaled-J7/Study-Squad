// frontend/src/pages/MyPostsPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import squadHubService from "../api/squadHubService";
import PostCard from "../components/squadhub/PostCard";
import Spinner from "../components/common/Spinner";
import InlineError from "../components/common/InlineError/InlineError";
import { ArrowLeft } from "lucide-react";
import "./SquadHubPage.css";

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      setIsLoading(true);
      const response = await squadHubService.getMyPosts();
      if (response.success) {
        setPosts(response.data);
      } else {
        setError(response.error);
      }
      setIsLoading(false);
    };
    fetchMyPosts();
  }, []);

  // Handler to remove a post from the list after it's been deleted
  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (error) return <InlineError message={error} />;
    if (posts.length === 0) {
      return (
        <p className="no-posts-message">You haven't created any posts yet.</p>
      );
    }
    return (
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="squadhub-page">
      <div className="squadhub-nav-header">
        <Link to="/squadhub" className="squadhub-back-link">
          <ArrowLeft size={20} />
          <span>Back to SquadHub</span>
        </Link>
      </div>
      <header className="squadhub-header">
        <div className="squadhub-header-text">
          <h1>My Posts</h1>
          <p>Manage and review the content you've shared with the community.</p>
        </div>
      </header>
      <main className="squadhub-main-content">{renderContent()}</main>
    </div>
  );
};

export default MyPostsPage;
