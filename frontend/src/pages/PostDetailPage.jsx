// frontend/src/pages/PostDetailPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";
import ConfirmationModal from "../components/common/ConfirmationModal";
import DropdownMenu from "../components/common/DropdownMenu";
import squadHubService from "../api/squadHubService";
import { getAvatarUrl } from "../utils/helpers";
import Spinner from "../components/common/Spinner";
import InlineError from "../components/common/InlineError/InlineError";
import {
  ThumbsUp,
  MessageSquare,
  Tag,
  Download,
  ArrowLeft,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./PostDetailPage.css";

dayjs.extend(relativeTime);

const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'comment', id: 5 }

  // Function to fetch/refresh post data
  const fetchPost = async () => {
    const response = await squadHubService.getPostDetail(postId);
    if (response.success) {
      setPost(response.data);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    // Check if newComment is either empty or just contains spaces.
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const response = await squadHubService.createComment(postId, newComment);
    if (response.success) {
      setNewComment("");
      await fetchPost(); // Refetch the post to show the new comment
    } else {
      alert(response.error); // Simple error handling for now
    }
    setIsSubmittingComment(false);
  };

  // HANDLER FOR LIKING THE POST
  const handlePostLike = async () => {
    if (!user) {
      // If user is not logged in, redirect to login
      navigate("/login");
      return;
    }
    // Optimistic update for instant feedback
    setPost((prevPost) => ({
      ...prevPost,
      is_liked: !prevPost.is_liked,
      likes_count: prevPost.is_liked
        ? prevPost.likes_count - 1
        : prevPost.likes_count + 1,
    }));
    // Call the API in the background
    await squadHubService.togglePostLike(postId);
  };

  // HANDLER FOR LIKING A COMMENT
  const handleCommentLike = async (commentId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Optimistic update for the specific comment
    setPost((prevPost) => ({
      ...prevPost,
      comments: prevPost.comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: !comment.is_liked,
            likes_count: comment.is_liked
              ? comment.likes_count - 1
              : comment.likes_count + 1,
          };
        }
        return comment;
      }),
    }));
    // Call the API in the background
    await squadHubService.toggleCommentLike(commentId);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    const response =
      type === "comment" ? await squadHubService.deleteComment(id) : null;
    if (response && response.success) {
      fetchPost(); // Refresh data
    } else if (response) {
      alert(response.error);
    }
    setItemToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="post-detail-container">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <InlineError message={error} />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title={`Delete ${itemToDelete?.type}?`}
      >
        <p>This action cannot be undone.</p>
      </ConfirmationModal>

      <div className="post-detail-page">
        <div className="post-detail-container">
          <Link to="/squadhub" className="back-link">
            <ArrowLeft size={18} /> Go Back
          </Link>

          <article className="post-content-area">
            <header className="post-header">
              <div className="post-header-tags">
                {post.tags.map((tag) => (
                  <span key={tag.id} className="post-header-tag">
                    #{tag.name}
                  </span>
                ))}
              </div>
              <h1>{post.title}</h1>
              <div className="post-meta">
                <img
                  src={getAvatarUrl(post.author)}
                  alt={post.author.username}
                  className="meta-avatar"
                />
                <span>
                  {post.author.first_name} {post.author.last_name}
                </span>
                <span className="meta-separator">·</span>
                <span>{dayjs(post.timestamp).format("MMMM D, YYYY")}</span>
              </div>
            </header>

            <div className="post-body">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {post.file_attachment && (
              <div className="post-attachment">
                <a
                  href={post.file_attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Download size={16} />
                  Download Attachment
                </a>
              </div>
            )}

            <footer className="post-actions-footer">
              <button
                className={`like-button ${post.is_liked ? "liked" : ""}`}
                onClick={handlePostLike}
              >
                <ThumbsUp size={20} />
                <span>{post.likes_count}</span>
              </button>
              <div className="comment-count">
                <MessageSquare size={20} />
                <span>{post.comments.length} Comments</span>
              </div>
            </footer>
          </article>

          <section className="post-comments-section">
            <h2>
              <MessageSquare size={24} /> Comments ({post.comments.length})
            </h2>

            {user && (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows="3"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingComment}
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
              </form>
            )}

            <div className="comments-list">
              {post.comments.map((comment) => {
                const isCommentOwner = user && user.id === comment.author.id;
                const dropdownOptions = [
                  {
                    label: "Delete",
                    action: () =>
                      setItemToDelete({ type: "comment", id: comment.id }),
                  },
                ];

                return (
                  <div key={comment.id} className="comment-card">
                    <img
                      src={getAvatarUrl(comment.author)}
                      alt={comment.author.username}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <div className="comment-author-info">
                          <span className="comment-author">
                            {comment.author.first_name}{" "}
                            {comment.author.last_name}
                          </span>
                          <span className="comment-timestamp">
                            {dayjs(comment.timestamp).fromNow()}
                          </span>
                        </div>
                        {isCommentOwner && (
                          <DropdownMenu options={dropdownOptions} />
                        )}
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-footer">
                        <button
                          className={`like-button ${
                            comment.is_liked ? "liked" : ""
                          }`}
                          onClick={() => handleCommentLike(comment.id)}
                        >
                          <ThumbsUp size={16} />
                          <span>{comment.likes_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
