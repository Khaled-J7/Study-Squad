// frontend/src/pages/MeetingPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import "./MeetingPage.css";

const MeetingPage = () => {
  const { roomName } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <Spinner />; // Or a redirect to login
  }

  return (
    <div className="meeting-page-container">
      <JitsiMeeting
        roomName={roomName}
        userInfo={{
          displayName: user.first_name + " " + user.last_name,
          email: user.email,
        }}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: false,
          enableEmailInStats: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
};
export default MeetingPage;
