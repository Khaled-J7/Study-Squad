// frontend/src/pages/dashboard/SubscribersPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import InlineError from "../../components/common/InlineError/InlineError";
import SubscriberCard from "../../components/dashboard/SubscriberCard";
import { Search, UserPlus, PlusCircle } from "lucide-react";
import "./SubscribersPage.css";

const SubscribersPage = () => {
  // State for the list of subscribers.
  const [subscribers, setSubscribers] = useState([]);
  // State for the user's search input.
  const [searchQuery, setSearchQuery] = useState("");
  // Loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We use useCallback to memoize the fetch function, so it's not recreated on every render.
  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const response = await studioService.getSubscribers(searchQuery);
    if (response.success) {
      setSubscribers(response.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  }, [searchQuery]); // The function re-runs ONLY when searchQuery changes.

  // This effect triggers the initial fetch when the component first mounts.
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Handler for the block action, passed down to each card.
  const handleBlockSubscriber = async (userId) => {
    const response = await studioService.blockSubscriber(userId);
    if (response.success) {
      // If blocking is successful, we refresh the list to show the change.
      fetchSubscribers();
    } else {
      // If it fails, we show an alert. A toast notification would be a good upgrade here.
      alert(response.error);
    }
  };

  // A helper function to decide what content to show based on the state.
  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (error) {
      return <InlineError message={error} />;
    }
    // This is the "no results" state for a search.
    if (searchQuery && subscribers.length === 0) {
      return (
        <div className="empty-state-container">
          <h2 className="empty-state-title">No Subscribers Found</h2>
          <p className="empty-state-text">
            Your search for "{searchQuery}" did not match any subscribers. Try a
            different name or username.
          </p>
        </div>
      );
    }
    // This is the "empty state" for when the teacher has no subscribers at all.
    if (subscribers.length === 0) {
      return (
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <UserPlus size={48} />
          </div>
          <h2 className="empty-state-title">Your Community Awaits</h2>
          <p className="empty-state-text">
            You don't have any subscribers yet. Create amazing courses and
            engage with learners to grow your studio!
          </p>
          <Link to="/my-studio/courses/new" className="btn-primary-main">
            <PlusCircle size={20} />
            <span>Start Crafting Courses</span>
          </Link>
        </div>
      );
    }
    // If we have subscribers, we render the list of cards.
    return (
      <div className="subscribers-list">
        {subscribers.map((sub) => (
          <SubscriberCard
            key={sub.id}
            subscriber={sub}
            onBlock={handleBlockSubscriber}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="subscribers-page">
      <div className="page-header">
        <h1>Subscribers</h1>
        <p>Manage your community and connect with your learners.</p>
      </div>

      <div className="search-bar-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {renderContent()}
    </div>
  );
};

export default SubscribersPage;
