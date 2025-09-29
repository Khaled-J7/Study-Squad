// frontend/src/pages/SquadHubPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import squadHubService from "../api/squadHubService";
import PostCard from "../components/squadhub/PostCard";
import Spinner from "../components/common/Spinner";
import InlineError from "../components/common/InlineError/InlineError";
import squadHubLogo from "../assets/SquadHUB_logo.png";
import { Plus, ArrowLeft } from "lucide-react";
import "./SquadHubPage.css";

const SquadHubPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const response = await squadHubService.getPosts();
      if (response.success) {
        setPosts(response.data);
      } else {
        setError(response.error);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    if (error) {
      return <InlineError message={error} />;
    }
    if (posts.length === 0) {
      return (
        <p className="no-posts-message">
          No posts yet. Be the first to start a conversation!
        </p>
      );
    }
    return (
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="squadhub-page">
      <div className="squadhub-nav-header"></div>
      <header className="squadhub-header">
        <div className="squadhub-header-content">
          <img
            src={squadHubLogo}
            alt="SquadHub Logo"
            className="squadhub-logo"
          />
          <div className="squadhub-header-text">
            <h1>Welcome to the SquadHub</h1>
            <p>Connect, share, and learn with the community.</p>
          </div>
        </div>
        {/* Link to My Posts page */}
        <Link to="/squadhub/my-posts" className="squadhub-my-posts-link">
          My Posts
        </Link>
        <Link
          to="/squadhub/create-post"
          className="btn btn-primary create-post-btn"
        >
          <Plus size={20} />
          <span>Create Post</span>
        </Link>
      </header>
      <main className="squadhub-main-content">{renderContent()}</main>
    </div>
  );
};

export default SquadHubPage;
