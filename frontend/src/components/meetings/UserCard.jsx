// frontend/src/components/meetings/UserCard.jsx
import React from "react";
import { getAvatarUrl } from "../../utils/helpers";
import { Plus } from "lucide-react";
import "./UserCard.css";

const UserCard = ({ user, onAdd }) => {
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="user-card">
      <div className="user-card-info">
        <img src={avatarUrl} alt={user.username} className="user-card-avatar" />
        <div>
          <p className="user-card-name">
            {user.first_name} {user.last_name}
          </p>
          <p className="user-card-username">@{user.username}</p>
        </div>
      </div>
      <button type="button" className="btn-add" onClick={() => onAdd(user)}>
        <Plus size={16} /> Add
      </button>
    </div>
  );
};

export default UserCard;
