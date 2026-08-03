import { Link } from 'react-router-dom';
import Button from '../ui/Button';

/**
 * Renders the correct friend-relationship action(s) for a given pair of users,
 * per the spec's relationship table:
 *   none      -> "Add Friend"
 *   outgoing  -> "Request Sent" (greyed out, not clickable)
 *   incoming  -> "Accept" + "Reject"
 *   friends   -> "Message" + "Unfriend"
 *   self      -> "Edit Profile" (handled by the caller, not this component)
 *
 * This is a pure presentation component — it takes the already-resolved
 * relationship + handlers as props, so it can be reused on the People page
 * cards (compact) and the Profile page header (full-size) alike.
 */
export default function RelationshipButton({
  relationship,
  size = 'sm',
  onAddFriend,
  onAccept,
  onReject,
  onUnfriend,
  messageHref,
}) {
  if (relationship === 'none') {
    return (
      <Button size={size} onClick={onAddFriend}>
        Add Friend
      </Button>
    );
  }

  if (relationship === 'outgoing') {
    return (
      <Button size={size} variant="secondary" disabled>
        Request Sent
      </Button>
    );
  }

  if (relationship === 'incoming') {
    return (
      <div className="flex gap-2">
        <Button size={size} onClick={onAccept}>Accept</Button>
        <Button size={size} variant="secondary" onClick={onReject}>Reject</Button>
      </div>
    );
  }

  if (relationship === 'friends') {
    return (
      <div className="flex gap-2">
        {messageHref && (
          <Link to={messageHref}>
            <Button size={size} variant="secondary">Message</Button>
          </Link>
        )}
        <Button size={size} variant="danger" onClick={onUnfriend}>Unfriend</Button>
      </div>
    );
  }

  return null;
}
