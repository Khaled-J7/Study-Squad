// frontend/src/components/common/TagInput.jsx
import React, { useState } from "react";
import "./TagInput.css";

/**
 * A reusable component for inputting a list of tags.
 * @param {Object} props
 * @param {string[]} props.tags - The current array of tags from the parent's state.
 * @param {Function} props.setTags - The state setter function from the parent.
 * @param {string} props.label - The label for the input field.
 * @param {string} [props.placeholder='Add a tag and press Enter'] - Optional placeholder text.
 * @param {number} [props.maxTags=5] - Optional limit for the number of tags.
 */
const TagInput = ({
  tags,
  setTags,
  label,
  placeholder = "Add a tag and press Enter",
  maxTags = 5,
}) => {
  // This state is local to the component and tracks the text currently in the input field.
  const [currentTag, setCurrentTag] = useState("");

  // This function handles adding a new tag when the user presses 'Enter'.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault(); // Prevents form submission on Enter key.
      const newTag = currentTag.trim().toLowerCase();

      // We only add the tag if it's not a duplicate and we haven't reached the max limit.
      if (tags.length < maxTags && !tags.includes(newTag)) {
        setTags([...tags, newTag]); // We call the parent's state setter function.
      }
      setCurrentTag(""); // Clear the input field after adding a tag.
    }
  };

  // This function handles removing a tag when the 'x' button is clicked.
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="form-group">
      <label htmlFor="tags">{label}</label>
      <div className="tags-input-container">
        {tags.map((tag, index) => (
          <div key={index} className="tag-item">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          id="tags"
          placeholder={
            tags.length < maxTags
              ? placeholder
              : `Maximum ${maxTags} tags reached`
          }
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags} // Disable input when max tags are reached.
        />
      </div>
    </div>
  );
};

export default TagInput;
