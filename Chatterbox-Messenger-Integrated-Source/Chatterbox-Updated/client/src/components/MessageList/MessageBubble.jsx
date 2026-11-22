import {
  Check,
  CheckCheck,
  Reply,
  X,
  Check as SaveIcon,
  FileText,
  ZoomIn,
} from "lucide-react";

import MentionText from "../MentionText";

import MessageActions from "./MessageActions";
import "./MessageBubble.css";
import MessageDeleteConfirm from "./MessageDeleteConfirm";

import {
  sameId,
  getMessageId,
  getAttachmentUrl,
  getReplyPreview,
} from "../../utils/messageHelpers";


// Supports common reaction shapes; adapt this if messageExtras uses a different schema.
function getReactionBadges(reactions) {
  if (!reactions) return [];
  const counts = new Map();
  const add = (emoji, count = 1) => {
    if (typeof emoji !== "string" || !emoji.trim()) return;
    const amount = Number(count);
    if (!Number.isFinite(amount) || amount <= 0) return;
    counts.set(emoji, (counts.get(emoji) || 0) + amount);
  };
  if (Array.isArray(reactions)) {
    reactions.forEach((reaction) => {
      if (typeof reaction === "string") add(reaction);
      else if (reaction && typeof reaction === "object") {
        add(reaction.emoji ?? reaction.reaction ?? reaction.type,
          reaction.count ?? reaction.total ?? 1);
      }
    });
  } else if (typeof reactions === "object") {
    Object.entries(reactions).forEach(([emoji, value]) => {
      if (typeof value === "number") add(emoji, value);
      else if (Array.isArray(value)) add(emoji, value.length);
      else if (value && typeof value === "object") {
        if (value.emoji) add(value.emoji, value.count ?? 1);
        else if (typeof value.count === "number") add(emoji, value.count);
      } else if (value === true) add(emoji);
    });
  }
  return [...counts].map(([emoji, count]) => ({ emoji, count }));
}

function getMessageAuthorName(message, user, mine) {
  if (mine) return "You";
  return message?.senderName ||
    (typeof message?.sender === "object"
      ? message.sender?.username || message.sender?.name
      : null) || "User";
}

export default function MessageBubble({
  message,
  mine,
  user,
  isGroup = false,
  loggedInUserId,
  messageTime,
  replyTarget,
  editing,
  editDraft,
  savingEdit,
  setEditDraft,
  saveEditedMessage,
  cancelEditing,
  startEditing,
  onReply,
  removeImage,
  onOpenImage,
  jumpToMessage,
  menuOpen,
  onToggleMenu,
  confirmDelete,
  deleteType,
  onDeleteForYou,
  onDeleteForEveryone,
  onConfirmDelete,
  onCancelDelete,
  onMessageAction,
  onReact,
}) {
  const deleted = message.isDeleted === true;
  const attachment = message.attachment;
  const attachmentUrl = getAttachmentUrl(attachment);
  const isImage = attachment?.mimeType?.startsWith("image/");
  const reactionBadges = getReactionBadges(message.reactions);

  // Compare the author of this message with the author of the quoted message.
  const senderIdOf = (item) => {
    const sender = item?.sender;
    return item?.senderId ?? item?.userId ??
      (typeof sender === "object" && sender !== null
        ? sender._id ?? sender.id
        : sender) ?? null;
  };

  const originalSenderId = senderIdOf(replyTarget);
  const currentSenderId = senderIdOf(message);
  const selfReply = originalSenderId != null && currentSenderId != null &&
    sameId(originalSenderId, currentSenderId);
  const originalIsMe = originalSenderId != null && loggedInUserId != null &&
    sameId(originalSenderId, loggedInUserId);
  const originalName = replyTarget?.senderName ||
    (typeof replyTarget?.sender === "object"
      ? replyTarget.sender?.username || replyTarget.sender?.name
      : null) || "User";
  const currentName = getMessageAuthorName(message, user, mine);
  const replyHeading = selfReply
    ? (mine ? "You replied to yourself" : `${currentName} replied to themselves`)
    : mine
      ? `You replied to ${originalIsMe ? "yourself" : originalName}`
      : `${currentName} replied to ${originalIsMe ? "you" : originalName}`;

  function getSenderDisplayName() {
    const sender = message?.sender;

    const senderName =
      message?.senderName ||
      (typeof sender === "object" && sender !== null
        ? sender.username || sender.name
        : null);

    if (senderName) return senderName;

    if (mine) {
      return user?.username || user?.name || "You";
    }

    return "User";
  }

  return (
    <div className="message-content">
      {isGroup && !mine && (
  <div className="message-heading">
    <span className="sender-name">
      {getSenderDisplayName()}
    </span>

    <span className="message-time">
      {messageTime}
    </span>
  </div>
)}

 
<div className={`message-bubble-wrap ${mine ? "message-wrap-mine" : "message-wrap-theirs"}`}>
  {/* =====================================
      REPLY PREVIEW - OUTSIDE THE BUBBLE
  ===================================== */}

  {!deleted && replyTarget && (
    <button
      type="button"
      className="reply-quote"
      onClick={() =>
        jumpToMessage(getMessageId(replyTarget))
      }
      title="Go to original message"
    >

<div className="reply-quote-heading">
  <Reply size={14} />
  <span>{replyHeading}</span>
</div>


      <p className="reply-quote-text">
        {getReplyPreview(replyTarget)}
      </p>
    </button>
  )}

  <div className="message-bubble-surface">
  {/* =====================================
      ACTUAL MESSAGE BUBBLE
  ===================================== */}

  <div
    className={`message-bubble ${
      mine ? "bubble-mine" : "bubble-theirs"
    } ${editing ? "bubble-editing" : ""} ${
      deleted ? "bubble-deleted" : ""
    }`}
  >
    {deleted ? (
      <div className="deleted-message">
        {sameId(message.deletedBy, loggedInUserId)
          ? "You deleted this message"
          : "This message was deleted"}
      </div>
    ) : editing ? (
      <>
        {/* Existing image attachment while editing */}
        {attachment && isImage && (
          <div className="message-attachment">
            <img
              src={attachmentUrl}
              alt={
                attachment.originalName || "Attachment"
              }
              className="message-image"
            />
          </div>
        )}

        {/* Message editing form */}
        <div className="message-edit-form">
          <textarea
            className="message-edit-input"
            value={editDraft}
            onChange={(event) =>
              setEditDraft(
                event.target.value.slice(0, 4000)
              )
            }
            maxLength={4000}
            rows={Math.min(
              6,
              Math.max(
                2,
                (editDraft || "").split("\n").length
              )
            )}
            autoFocus
            aria-label="Edit message"
          />

          <div className="message-edit-footer">
            <span className="edit-character-count">
              {(editDraft || "").length}/4000
            </span>

            <div className="message-edit-actions">
              <button
                type="button"
                className="message-action-button cancel-edit-button"
                onClick={cancelEditing}
                disabled={savingEdit}
              >
                <X size={15} />
                Cancel
              </button>

              <button
                type="button"
                className="message-action-button save-edit-button"
                onClick={() =>
                  saveEditedMessage(message)
                }
                disabled={
                  savingEdit ||
                  (!editDraft.trim() && !attachment)
                }
              >
                <SaveIcon size={15} />

                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </>
    ) : (
      <>
        {/* =====================================
            MESSAGE ATTACHMENTS
        ===================================== */}

        {attachment && (
          <div className="message-attachment">
            {isImage ? (
              <button
                type="button"
                className="message-image-button"
                onClick={() =>
                  onOpenImage(attachment, message)
                }
                aria-label="View image larger"
              >
                <img
                  src={attachmentUrl}
                  alt={
                    attachment.originalName ||
                    "Attachment"
                  }
                  className="message-image"
                  loading="lazy"
                />

                <span className="image-zoom-hint">
                  <ZoomIn size={16} />
                  View image
                </span>
              </button>
            ) : (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="message-file-link"
              >
                <span className="message-file-icon">
                  <FileText size={20} />
                </span>

                <span className="message-file-details">
                  <strong>
                    {attachment.originalName ||
                      "Download file"}
                  </strong>

                  <small>Open attachment</small>
                </span>
              </a>
            )}

            {/* Remove image */}
            {mine && isImage && removeImage && (
              <button
                type="button"
                className="remove-message-image"
                onClick={() =>
                  removeImage(getMessageId(message))
                }
                aria-label="Remove image attachment"
                title="Remove image"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* =====================================
            MESSAGE TEXT
        ===================================== */}

        {message.text?.trim() && (
          <div className="message-text">
            <MentionText text={message.text} />
          </div>
        )}
      </>
    )}
  </div>
{!deleted && reactionBadges.length > 0 && (
  <div className="message-reaction-badges">
    {reactionBadges.map(({ emoji, count }) => (
      <span className="message-reaction-badge" key={emoji}>
        <span>{emoji}</span>
        {count > 1 && (
          <span className="message-reaction-count">
            {count}
          </span>
        )}
      </span>
    ))}
  </div>
)}

        {!editing && !deleted && (
          <MessageActions
            mine={mine}
            isImage={isImage}
            text={message.text || ""}
            pinned={Boolean(message.isPinned)}
            onAction={(action) => onMessageAction?.(message, action)}
            onReact={(emoji) => onReact?.(message, emoji)}
            menuOpen={menuOpen}
            onReply={onReply}
            onEdit={() => startEditing?.(message)}
            onToggleMenu={onToggleMenu}
            onDeleteForYou={onDeleteForYou}
            onDeleteForEveryone={onDeleteForEveryone}
          />
        )}
      </div>
      </div>

      {confirmDelete && !deleted && (
        <MessageDeleteConfirm
          mine={mine}
          deleteType={deleteType}
          onConfirm={() => onConfirmDelete(message)}
          onCancel={onCancelDelete}
        />
      )}

      {mine && !deleted && (
        <div className="message-meta">
          {message.updatedAt &&
            message.createdAt &&
            new Date(message.updatedAt).getTime() >
              new Date(message.createdAt).getTime() && (
              <span className="edited-label">Edited</span>
            )}

          <span className="message-time">
            {messageTime}
          </span>

          <span
            className={`read-check ${
              message.read ? "message-read" : ""
            }`}
            title={message.read ? "Read" : "Sent"}
            aria-label={message.read ? "Read" : "Sent"}
          >
            {message.read ? (
              <CheckCheck size={15} />
            ) : (
              <Check size={15} />
            )}
          </span>
        </div>
      )}
    </div>
  );
}
