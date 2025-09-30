// frontend/src/components/meetings/UserSearch.jsx
import React, { useState, useEffect } from "react";
import meetingService from "../../api/meetingService";
import UserCard from "./UserCard";
import "./UserSearch.css";

const UserSearch = ({ onAddInvitee }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const response = await meetingService.searchUsers(query);
      if (response.success) {
        setResults(response.data);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      search();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="user-search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users to invite..."
          className="search-input"
        />
      </div>
      <div className="search-results">
        {isLoading && <p>Searching...</p>}
        {!isLoading &&
          results.map((user) => (
            <UserCard key={user.id} user={user} onAdd={onAddInvitee} />
          ))}
      </div>
    </div>
  );
};

export default UserSearch;
