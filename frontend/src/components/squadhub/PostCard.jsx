// frontend/src/components/squadhub/PostCard.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../utils/helpers";
import DropdownMenu from "../common/DropdownMenu";
import ConfirmationModal from "../common/ConfirmationModal";
import squadHubService from "../../api/squadHubService";
import {
  ThumbsUp,
  MessageSquare,
  Tag,
  User,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./PostCard.css";

dayjs.extend(relativeTime);

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useContext(AuthContext);
  const authorAvatar = getAvatarUrl(post.author);
  // Check if the author is teacher
  const isTeacher = post.author.is_teacher;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isOwner = user && user.id === post.author.id;

  console.log("Teacher:", isTeacher);
  console.log("Studio:", post.author.studio);
  console.log("Studio ID:", post.author.studio?.id);

  const handleDelete = async () => {
    const response = await squadHubService.deletePost(post.id);
    if (response.success) {
      if (onPostDeleted) onPostDeleted(post.id);
    } else {
      alert(response.error);
    }
    setIsConfirmingDelete(false);
  };

  const dropdownOptions = [
    { label: "Delete", action: () => setIsConfirmingDelete(true) },
  ];

  return (
    <>
      <ConfirmationModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Delete Post?"
      >
        <p>This action cannot be undone and your post will be lost forever.</p>
      </ConfirmationModal>

      <div className="post-card">
        <div className="post-card-header">
          <div className="post-card-author">
            {isTeacher && post.author.studio ? (
              <Link to={`/studios/${post.author.studio.id}`}>
                <img
                  src={authorAvatar}
                  alt={post.author.username}
                  className="author-avatar clickable-avatar"
                />
              </Link>
            ) : (
              <img
                src={authorAvatar}
                alt={post.author.username}
                className="author-avatar"
              />
            )}
            <div className="author-info">
              <div className="author-name-badge">
                <span className="author-name">
                  {post.author.first_name} {post.author.last_name}
                </span>
                <span
                  className={`role-badge ${isTeacher ? "teacher" : "student"}`}
                >
                  {isTeacher ? <Briefcase size={12} /> : <User size={12} />}
                  {isTeacher ? "Teacher" : "Student"}
                </span>
              </div>
              <span className="post-timestamp">
                {dayjs(post.timestamp).fromNow()}
              </span>
            </div>
          </div>
          {isOwner && <DropdownMenu options={dropdownOptions} />}
        </div>

        <div className="post-card-content">
          <Link to={`/squadhub/posts/${post.id}`} className="post-title-link">
            <h3 className="post-title">{post.title}</h3>
          </Link>
          <div className="post-card-tags">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="post-tag">
                <Tag size={14} /> {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="post-card-footer">
          <div className="post-stats">
            <span>
              <ThumbsUp size={16} /> {post.likes_count}
            </span>
            <span>
              <MessageSquare size={16} /> {post.comments.length}
            </span>
          </div>
          <div className="footer-actions">
            <Link to={`/squadhub/posts/${post.id}`} className="read-more-link">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;
