
import {
  PhoneOff,
  Users,
  CircleDot,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  RoomContext,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";

import "@livekit/components-styles";
import "./GroupCallModal.css";

export default function GroupCallModal({
  call,
  room,
  participants = [],
  connectionState = "connected",
  error = "",
  onClose,
}) {
  if (!call || !room) return null;

  // ==========================================
  // CONNECTION STATUS
  // ==========================================

  const isConnected = connectionState === "connected";

  const isConnecting =
    connectionState === "connecting" ||
    connectionState === "reconnecting";

  const participantCount = participants.length + 1;

  // ==========================================
  // LEAVE MEETING
  // ==========================================

  const handleLeave = () => {
    if (typeof onClose !== "function") return;

    onClose();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="group-call-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Group call"
    >
      <div className="group-call-modal">

        {/* ======================================
            MEETING HEADER
        ====================================== */}

        <header className="group-call-header">

          <div className="group-call-heading">

            <div className="group-call-heading-icon">
              <Users size={21} />
            </div>

            <div>
              <h2>
                {call.groupName || "Chatterbox Meeting"}
              </h2>

              <p>
                {call.callType === "audio"
                  ? "Audio meeting"
                  : "Video meeting"}

                {" · "}

                Up to {call.maxParticipants || 10} participants
              </p>
            </div>

          </div>

          <div className="group-call-header-actions">

            {/* LIVE STATUS */}

            <div
              className={`group-call-live ${
                isConnected ? "is-connected" : ""
              }`}
            >
              {isConnecting ? (
                <LoaderCircle
                  size={14}
                  className="group-call-spinner"
                />
              ) : (
                <CircleDot size={13} />
              )}

              {isConnecting
                ? "CONNECTING"
                : isConnected
                  ? "LIVE"
                  : "RECONNECTING"}
            </div>

            {/* LEAVE BUTTON */}

            <button
              type="button"
              className="group-call-close"
              onClick={handleLeave}
              aria-label="Leave group meeting"
            >
              <PhoneOff size={18} />

              <span>Leave</span>
            </button>

          </div>

        </header>

        {/* ======================================
            PARTICIPANT INFORMATION
        ====================================== */}

        <div className="group-call-participant-count">
          <Users size={15} />

          <span>
            {participantCount}{" "}
            {participantCount === 1
              ? "participant"
              : "participants"}
          </span>
        </div>

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div
            className="group-call-error"
            role="alert"
          >
            <AlertCircle size={16} />

            <span>{error}</span>
          </div>
        )}

        {/* ======================================
            LIVEKIT MEETING ROOM
        ====================================== */}

        <RoomContext.Provider value={room}>
          <main className="group-call-room">

            <RoomAudioRenderer />

            <VideoConference />

          </main>
        </RoomContext.Provider>

      </div>
    </div>
  );
}
