import { Link } from 'react-router-dom';
import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, activeUserId, isOnline, className }) {
  if (conversations.length === 0) {
    return (
      <div className={className}>
        <div className="p-6 text-center text-sm text-gray-400">
          You have no friends yet —{' '}
          <Link to="/people" className="text-brand-600 hover:underline">
            go to People
          </Link>{' '}
          to connect.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {conversations.map((conversation) => (
        <Link key={conversation.friend.id} to={`/chat/${conversation.friend.id}`} className="block">
          <ConversationItem
            conversation={conversation}
            isActive={conversation.friend.id === activeUserId}
            isOnline={isOnline(conversation.friend.id)}
            onClick={() => {}}
          />
        </Link>
      ))}
    </div>
  );
}
