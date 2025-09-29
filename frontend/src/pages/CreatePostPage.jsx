// frontend/src/pages/CreatePostPage.jsx

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import squadHubService from "../api/squadHubService";
import MDXEditorComponent from "../components/common/MDXEditorComponent";
import TagInput from "../components/common/TagInput";
import InlineError from "../components/common/InlineError/InlineError";
import { UploadCloud, File, X } from "lucide-react";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [fileAttachment, setFileAttachment] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protect the route: if no user is logged in, redirect them.
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    setFileAttachment(e.target.files[0]);
  };

  const removeFile = () => {
    setFileAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    tags.forEach((tag) => formData.append("tag_names", tag));
    if (fileAttachment) {
      formData.append("file_attachment", fileAttachment);
    }

    const response = await squadHubService.createPost(formData);

    if (response.success) {
      navigate("/squadhub"); // Redirect to the main hub on success
    } else {
      setError(response.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <header className="create-post-header">
          <h1>Create a New Post</h1>
          <p>Share your knowledge, ask a question, or start a discussion.</p>
        </header>
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A clear and descriptive title"
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <MDXEditorComponent markdown={content} onChange={setContent} />
          </div>

          <div className="form-group">
            <TagInput tags={tags} setTags={setTags} label="Tags (up to 5)" />
          </div>

          <div className="form-group">
            <label>Attach a File (Optional)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-attachment"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-attachment" className="file-input-label">
                <UploadCloud size={20} />
                <span>{fileAttachment ? "Change file" : "Choose a file"}</span>
              </label>
              {fileAttachment && (
                <div className="file-preview">
                  <File size={16} />
                  <span>{fileAttachment.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="remove-file-button"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            {error && <InlineError message={error} />}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
