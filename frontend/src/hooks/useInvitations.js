// frontend/src/hooks/useInvitations.js

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import meetingService from "../api/meetingService";

const POLLING_INTERVAL = 5000; // Check every 5 seconds

export const useInvitations = () => {
  const { user, updateInvitations } = useAuth();

  useEffect(() => {
    let intervalId;

    const fetchInvitations = async () => {
      // We only fetch if the user is logged in.
      if (user) {
        const response = await meetingService.getMyInvitations();
        if (response.success) {
          // When we get new invitations, we update the global context.
          updateInvitations(response.data);
        }
      }
    };

    // Immediately check for invitations when the hook loads.
    fetchInvitations();

    // Then, set up the timer to check repeatedly.
    intervalId = setInterval(fetchInvitations, POLLING_INTERVAL);

    // This is a crucial cleanup step. When the component unmounts,
    // we clear the timer to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, [user, updateInvitations]); // This effect re-runs if the user logs in or out.
};
