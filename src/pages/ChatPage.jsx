import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useChat } from '../hooks/useChat';
import { useChatSettings } from '../hooks/useChatSettings';
import { useAI } from '../hooks/useAI';
import { useNowTick } from '../hooks/useNowTick';
import { storage } from '../utils/storage';
import { groupMessagesBySender } from '../utils/chatHelpers';
import { getThemeById } from '../utils/chatThemes';
import { showToast } from '../utils/toastBus';
import ConversationList from '../components/chat/ConversationList';
import ChatHeader from '../components/chat/ChatHeader';
import ChatProfilePanel from '../components/chat/ChatProfilePanel';
import AIChatBanner from '../components/chat/AIChatBanner';
import AISuggestionChips from '../components/chat/AISuggestionChips';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import ReplyPreview from '../components/chat/ReplyPreview';
import TypingIndicator from '../components/chat/TypingIndicator';
import Lightbox from '../components/chat/Lightbox';

const AUTO_REPLY_DELAY_MS = 1500;
// Cap on how much recent history is sent as context. slice(-N) is naturally
// adaptive: a brand-new conversation with 1 message just sends that 1
// message — it never fails or pads out context that doesn't exist yet — a
// long-running thread sends its most recent N, which keeps prompts small
// while still giving the model enough to stay on-topic.
const AI_CONTEXT_MESSAGE_COUNT = 10;

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getFriendIds, areFriends, version: friendsVersion } = useFriends();
  const {
    getMessages,
    sendMessage,
    markConversationRead,
    toggleReaction,
    searchMessages,
    getMessageById,
    deleteMessageForMe,
    deleteMessageForEveryone,
    togglePinMessage,
    getConversations,
    isOnline,
    getLastSeen,
    setTyping,
    isOtherTyping,
    getConversationTheme,
    setConversationTheme,
  } = useChat();
  const {
    getNickname,
    setNickname,
    isMuted,
    toggleMute,
    isArchived,
    toggleArchive,
    isHidden,
    hideConversation,
    readReceiptsEnabled,
    toggleReadReceipts,
    isBlocked,
    toggleBlock,
  } = useChatSettings();
  const { generateChatSuggestions, generateReplySuggestions, generateAutoReply, generateFriendReply, getAISettings, setAISettings } = useAI();

  const [draft, setDraft] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  // Suggestions generated from an explicit "Reply" click on a specific message
  // (three-dot menu) — kept separate from the "last message" suggestions above
  // so picking Reply on an older message always shows suggestions for THAT
  // message, regardless of what the newest message in the thread is.
  const [replySuggestions, setReplySuggestions] = useState([]);
  const [replySuggestionsLoading, setReplySuggestionsLoading] = useState(false);
  const [aiSettings, setAiSettingsState] = useState(() => getAISettings(currentUser.id));
  const [replyTo, setReplyTo] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('all'); // 'all' | 'unread'
  const messagesEndRef = useRef(null);
  // Keyed on `${messageId}::${personality}` (not just messageId) so that
  // changing personality on the SAME last message re-triggers a fresh
  // generation instead of silently keeping the old suggestions — this was
  // the root cause of "changing personality doesn't change the replies".
  const lastSuggestedKey = useRef(null);
  const lastAutoRepliedMessageId = useRef(null);
  const autoReplyTimeoutRef = useRef(null);
  // Simulated friend auto-reply: this app has only one real logged-in user
  // (no backend, no second live session), so without this a message you
  // send to a friend just sits there forever with nothing coming back.
  const lastFriendRepliedMessageId = useRef(null);
  const friendReplyTimeoutRef = useRef(null);
  const [friendIsSimulatingReply, setFriendIsSimulatingReply] = useState(false);

  useNowTick(1000);

  const isValidChat = !userId || areFriends(currentUser.id, userId);

  const friendIds = useMemo(
    () => getFriendIds(currentUser.id),
    [getFriendIds, currentUser.id, friendsVersion]
  );
  const friends = useMemo(
    () => storage.getUsers().filter((u) => friendIds.includes(u.id)),
    [friendIds]
  );
  const allConversations = getConversations(currentUser.id, friends);
  // Archived/hidden ("deleted for me") conversations stay out of the main
  // sidebar — same "hide, don't destroy" pattern as delete-for-me on messages.
  const conversations = allConversations
    .filter((c) => !isArchived(c.conversationId, currentUser.id) && !isHidden(c.conversationId, currentUser.id))
    .filter((c) => c.friend.name.toLowerCase().includes(sidebarQuery.trim().toLowerCase()))
    .filter((c) => sidebarFilter === 'all' || c.unreadCount > 0);
  const selectedFriend = userId ? friends.find((f) => f.id === userId) : null;
  const conversationId = selectedFriend
    ? allConversations.find((c) => c.friend.id === selectedFriend.id)?.conversationId
    : null;

  const messages = useMemo(
    () => (conversationId ? getMessages(conversationId, currentUser.id) : []),
    [conversationId, currentUser.id, getMessages]
  );
  const groupedMessages = groupMessagesBySender(messages);
  const lastMessage = messages[messages.length - 1] || null;
  const searchMatches = conversationId && searchQuery.trim() ? searchMessages(conversationId, searchQuery) : [];
  const matchedIds = new Set(searchMatches.map((m) => m.id));

  const theme = getThemeById(conversationId ? getConversationTheme(conversationId) : 'default');
  const nickname = conversationId ? getNickname(conversationId, currentUser.id, selectedFriend?.id) : null;
  const weBlockedThem = conversationId && selectedFriend ? isBlocked(currentUser.id, selectedFriend.id) : false;
  const theyBlockedUs = conversationId && selectedFriend ? isBlocked(selectedFriend.id, currentUser.id) : false;
  const blockedMessage = weBlockedThem
    ? "You've blocked this person — unblock them in Conversation info to send a message."
    : theyBlockedUs
    ? 'You can no longer reply to this conversation.'
    : null;

  // Mark the conversation as read UNLESS the viewer has turned off read
  // receipts for it — disabling receipts means your opens don't reveal to
  // the other person that you've seen their messages.
  useEffect(() => {
    if (conversationId && readReceiptsEnabled(conversationId, currentUser.id)) {
      markConversationRead(conversationId, currentUser.id);
    }
  }, [conversationId, messages.length, currentUser.id, markConversationRead, readReceiptsEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversationId]);

  useEffect(() => {
    setSearchQuery('');
    setDraft('');
    setSuggestions([]);
    setReplyTo(null);
    setProfileOpen(false);
  }, [conversationId]);

  useEffect(() => {
    setAiSettingsState(getAISettings(currentUser.id));
  }, [currentUser.id, getAISettings]);

  const otherIsTyping = conversationId && selectedFriend ? isOtherTyping(conversationId, selectedFriend.id) : false;

  // ---- AI Mode 1: suggestion chips ----
  useEffect(() => {
    if (!aiSettings.aiEnabled || !selectedFriend || !lastMessage) {
      setSuggestions([]);
      return;
    }
    // Suggestion chips should be available for the latest friend message even
    // when that message was generated by the app's simulated AI reply flow.
    const isFriendMessage = lastMessage.senderId === selectedFriend.id && lastMessage.type !== 'system';
    if (!isFriendMessage) {
      setSuggestions([]);
      return;
    }
    const key = `${lastMessage.id}::${aiSettings.aiPersonality}`;
    if (lastSuggestedKey.current === key) return;
    lastSuggestedKey.current = key;

    const recent = messages.slice(-AI_CONTEXT_MESSAGE_COUNT).map((m) => ({
      senderName: m.senderId === currentUser.id ? currentUser.name : selectedFriend.name,
      content: m.type === 'text' ? m.content : `[${m.type}]`,
    }));

    generateChatSuggestions({
      userName: currentUser.name,
      friendName: selectedFriend.name,
      recentMessages: recent,
      personality: aiSettings.aiPersonality,
    })
      .then(setSuggestions)
      .catch(() => setSuggestions([])); // Mode 1 fails silently, per spec.
  }, [lastMessage, aiSettings.aiEnabled, aiSettings.aiPersonality, selectedFriend, messages, currentUser, generateChatSuggestions]);

  // ---- AI: reply suggestions for one specific message (three-dot "Reply" menu) ----
  // Fires whenever the user picks a message to reply to, independent of
  // whether that message is the newest one in the thread — analyzes THAT
  // message specifically, per the "context-aware reply" requirement.
  useEffect(() => {
    if (!aiSettings.aiEnabled || !selectedFriend || !replyTo || replyTo.type !== 'text') {
      setReplySuggestions((prev) => (prev.length ? [] : prev));
      setReplySuggestionsLoading((prev) => (prev ? false : prev));
      return;
    }

    setReplySuggestionsLoading(true);
    setReplySuggestions([]);

    const recent = messages.slice(-AI_CONTEXT_MESSAGE_COUNT).map((m) => ({
      senderName: m.senderId === currentUser.id ? currentUser.name : selectedFriend.name,
      content: m.type === 'text' ? m.content : `[${m.type}]`,
    }));

    let cancelled = false;
    generateReplySuggestions({
      userName: currentUser.name,
      friendName: selectedFriend.name,
      targetMessage: replyTo.content,
      recentMessages: recent,
      personality: aiSettings.aiPersonality,
    })
      .then((result) => { if (!cancelled) setReplySuggestions(result); })
      .catch(() => { if (!cancelled) setReplySuggestions([]); })
      .finally(() => { if (!cancelled) setReplySuggestionsLoading(false); });

    return () => { cancelled = true; };
  }, [replyTo, aiSettings.aiEnabled, aiSettings.aiPersonality, selectedFriend, messages, currentUser, generateReplySuggestions]);

  // ---- AI Mode 2: auto-reply ----
  useEffect(() => {
    if (autoReplyTimeoutRef.current) clearTimeout(autoReplyTimeoutRef.current);
    if (!aiSettings.aiChatEnabled || !selectedFriend || !lastMessage || !conversationId) return;
    // NOTE: does NOT exclude aiGenerated friend messages (unlike Mode 1's
    // suggestion-chip check) — the friend's replies in this app are always
    // simulated by AI (see "Simulated friend auto-reply" below), so
    // excluding aiGenerated ones meant this effect only ever fired once, on
    // the very first (seeded, non-AI) friend message, and never again for
    // the rest of the conversation. This is safe from an infinite AI<->AI
    // loop because the reply we send here is itself marked aiGenerated,
    // and the "Simulated friend auto-reply" effect below explicitly refuses
    // to respond to aiGenerated messages from the current user — so the
    // ping-pong stops there.
    const isFriendMessage = lastMessage.senderId === selectedFriend.id && lastMessage.type !== 'system';
    if (!isFriendMessage) return;
    if (lastAutoRepliedMessageId.current === lastMessage.id) return;
    lastAutoRepliedMessageId.current = lastMessage.id;

    const recent = messages.slice(-AI_CONTEXT_MESSAGE_COUNT).map((m) => ({
      senderName: m.senderId === currentUser.id ? currentUser.name : selectedFriend.name,
      content: m.type === 'text' ? m.content : `[${m.type}]`,
    }));

    autoReplyTimeoutRef.current = setTimeout(async () => {
      try {
        const reply = await generateAutoReply({
          userName: currentUser.name,
          friendName: selectedFriend.name,
          recentMessages: recent,
          personality: aiSettings.aiPersonality,
        });
        // Validate before sending: never auto-send an empty/placeholder
        // reply, and guard against a runaway response that isn't a normal
        // chat message.
        const trimmed = (reply || '').trim();
        if (!trimmed || trimmed.length > 600) {
          console.error('[AI auto-reply] response failed validation:', reply);
          showToast('AI reply failed — please reply manually', 'error');
          return;
        }
        sendMessage({ senderId: currentUser.id, receiverId: selectedFriend.id, type: 'text', content: trimmed, aiGenerated: true });
      } catch (err) {
        console.error('[AI auto-reply] failed:', err);
        showToast(`AI reply failed — ${err?.message || 'please reply manually'}`, 'error');
      }
    }, AUTO_REPLY_DELAY_MS);

    return () => clearTimeout(autoReplyTimeoutRef.current);
    // Deliberately depend on lastMessage?.id / lastMessage?.senderId (stable
    // primitives) rather than the `lastMessage` object or `messages` array
    // themselves. Those get a brand-new reference whenever ANY field on an
    // existing message changes — e.g. read-receipts flipping `read: true`
    // on this very message a moment after it arrives — which would re-run
    // this effect, run its cleanup, and cancel the pending timeout before
    // it ever fired, even though nothing about "should I reply" changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?.id, lastMessage?.senderId, lastMessage?.type, aiSettings.aiChatEnabled, aiSettings.aiPersonality, selectedFriend, conversationId, generateAutoReply, sendMessage]);

  // ---- Simulated friend auto-reply ----
  // Fires whenever the LAST message is one the current user genuinely typed
  // themselves (never for a message the AI generated on either side — that
  // would let the two AI features volley messages back and forth forever).
  // Gated on the master "aiEnabled" switch only (not the "Let AI reply for
  // me" toggle, which is specifically about the CURRENT user's own outgoing
  // voice) — turning AI off entirely also stops the friend from
  // auto-replying.
  useEffect(() => {
    if (friendReplyTimeoutRef.current) clearTimeout(friendReplyTimeoutRef.current);
    setFriendIsSimulatingReply(false);
    if (!aiSettings.aiEnabled || !selectedFriend || !lastMessage || !conversationId) return;
    const isUsersOwnMessage = lastMessage.senderId === currentUser.id && !lastMessage.aiGenerated && lastMessage.type !== 'system';
    if (!isUsersOwnMessage) return;
    if (lastFriendRepliedMessageId.current === lastMessage.id) return;
    lastFriendRepliedMessageId.current = lastMessage.id;

    const recent = messages.slice(-AI_CONTEXT_MESSAGE_COUNT).map((m) => ({
      senderName: m.senderId === currentUser.id ? currentUser.name : selectedFriend.name,
      content: m.type === 'text' ? m.content : `[${m.type}]`,
    }));

    setFriendIsSimulatingReply(true);
    friendReplyTimeoutRef.current = setTimeout(async () => {
      try {
        const reply = await generateFriendReply({
          userName: currentUser.name,
          friendName: selectedFriend.name,
          friendBio: selectedFriend.bio,
          recentMessages: recent,
        });
        const trimmed = (reply || '').trim();
        if (trimmed && trimmed.length <= 600) {
          sendMessage({ senderId: selectedFriend.id, receiverId: currentUser.id, type: 'text', content: trimmed, aiGenerated: true });
        }
      } catch (err) {
        // Silent to the user: the friend just doesn't reply this time — no
        // toast, since this is a background simulation, not an action the
        // user took. Still logged so the real cause is diagnosable.
        console.error('[AI friend-reply] failed:', err);
      } finally {
        setFriendIsSimulatingReply(false);
      }
    }, AUTO_REPLY_DELAY_MS);

    return () => clearTimeout(friendReplyTimeoutRef.current);
    // See the matching comment on the Mode 2 effect above: depend on
    // primitives derived from lastMessage, not the object/array themselves,
    // so an incidental metadata change (e.g. read-receipts) doesn't cancel
    // an already-scheduled simulated reply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?.id, lastMessage?.senderId, lastMessage?.aiGenerated, lastMessage?.type, aiSettings.aiEnabled, selectedFriend, conversationId, generateFriendReply, sendMessage]);

  useEffect(() => {
    if (!isValidChat) {
      showToast('You can only message friends — add them first', 'error');
      navigate('/friends', { replace: true });
    }
  }, [isValidChat, navigate]);

  if (!isValidChat) {
    return null;
  }

  const handleSend = ({ text, file }) => {
    if (file) {
      sendMessage({ senderId: currentUser.id, receiverId: selectedFriend.id, type: file.type, content: file.dataUrl });
    }
    if (text) {
      sendMessage({ senderId: currentUser.id, receiverId: selectedFriend.id, type: 'text', content: text, replyToId: replyTo?.id ?? null });
    }
    setDraft('');
    setSuggestions([]);
    setReplyTo(null);
  };

  const handleTyping = () => {
    if (conversationId) setTyping(conversationId, currentUser.id);
  };

  const handleChangeAISettings = (partial) => {
    setAISettings(currentUser.id, partial);
    setAiSettingsState((prev) => ({ ...prev, ...partial }));
  };

  const handleSetTheme = (themeId) => {
    setConversationTheme(conversationId, themeId, currentUser.id, currentUser.name, selectedFriend.id);
  };

  const handleDeleteChat = () => {
    hideConversation(conversationId, currentUser.id);
    setProfileOpen(false);
    showToast('Chat deleted from your inbox');
    navigate('/chat');
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-56px)] flex flex-col px-0 sm:px-4">
      <div className="flex-1 min-h-0 flex bg-white dark:bg-gray-900 sm:border sm:border-gray-200 sm:dark:border-gray-800 sm:rounded-xl overflow-hidden my-0 sm:my-3">
        <aside
          className={clsx(
            'w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col',
            selectedFriend && 'hidden md:flex'
          )}
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 space-y-2">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">Chats</h1>
            <input
              value={sidebarQuery}
              onChange={(e) => setSidebarQuery(e.target.value)}
              placeholder="Search Messenger"
              className="w-full text-sm rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-1.5">
              {['all', 'unread'].map((key) => (
                <button
                  key={key}
                  onClick={() => setSidebarFilter(key)}
                  className={clsx(
                    'text-xs font-medium px-3 py-1 rounded-full capitalize',
                    sidebarFilter === key
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ConversationList conversations={conversations} activeUserId={userId} isOnline={isOnline} />
          </div>
        </aside>

        <section className={clsx('flex-1 min-w-0 flex flex-col', !selectedFriend && 'hidden md:flex')}>
          {!selectedFriend ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-6 text-center">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <ChatHeader
                friend={selectedFriend}
                displayName={nickname}
                isOnline={isOnline(selectedFriend.id)}
                lastSeen={getLastSeen(selectedFriend.id)}
                onBack={() => navigate('/chat')}
                onSearch={setSearchQuery}
                resultCount={searchMatches.length}
                aiSettings={aiSettings}
                onChangeAISettings={handleChangeAISettings}
                onOpenProfile={() => setProfileOpen(true)}
              />

              {aiSettings.aiChatEnabled && (
                <AIChatBanner onDisable={() => handleChangeAISettings({ aiChatEnabled: false })} />
              )}

              <div className={clsx('relative flex-1 overflow-y-auto', theme.bg)}>
                {theme.overlay && (
                  <div className="pointer-events-none absolute inset-0" style={theme.overlay} aria-hidden="true" />
                )}
                <div className="relative p-4 space-y-1 min-h-full">
                {groupedMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No messages yet — say hello 👋
                  </div>
                )}
                {groupedMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUser.id}
                    bubbleColorClass={theme.bubble}
                    bubbleShadowClass={theme.bubbleShadow}
                    incomingBubbleClass={theme.incoming}
                    friend={selectedFriend}
                    showAvatar={message.showAvatar}
                    showTimestamp={message.showTimestamp}
                    currentUserId={currentUser.id}
                    replyToMessage={message.replyToId ? getMessageById(message.replyToId) : null}
                    onToggleReaction={(messageId, emoji) => toggleReaction(messageId, currentUser.id, emoji)}
                    onOpenLightbox={setLightboxSrc}
                    onReply={setReplyTo}
                    onPin={togglePinMessage}
                    onDeleteForMe={(id) => deleteMessageForMe(id, currentUser.id)}
                    onDeleteForEveryone={deleteMessageForEveryone}
                    highlight={matchedIds.has(message.id)}
                  />
                ))}
                {!replyTo && suggestions.length > 0 && (
                  <AISuggestionChips suggestions={suggestions} onPick={(text) => { setDraft(text); setSuggestions([]); }} />
                )}
                {(otherIsTyping || friendIsSimulatingReply) && <TypingIndicator name={selectedFriend.name.split(' ')[0]} />}
                <div ref={messagesEndRef} />
                </div>
              </div>

              <ReplyPreview message={replyTo} onCancel={() => setReplyTo(null)} />
              {replyTo && (replySuggestionsLoading || replySuggestions.length > 0) && (
                <AISuggestionChips
                  suggestions={replySuggestionsLoading ? [] : replySuggestions}
                  loading={replySuggestionsLoading}
                  inset={false}
                  onPick={(text) => { setDraft(text); setReplySuggestions([]); }}
                />
              )}
              <MessageInput
                value={draft}
                onChange={setDraft}
                onSend={handleSend}
                onTyping={handleTyping}
                blockedMessage={blockedMessage}
              />
            </>
          )}
        </section>
      </div>

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {profileOpen && selectedFriend && conversationId && (
        <ChatProfilePanel
          friend={selectedFriend}
          nickname={nickname}
          currentTheme={theme}
          isMuted={isMuted(conversationId, currentUser.id)}
          isReadReceiptsOn={readReceiptsEnabled(conversationId, currentUser.id)}
          isBlocked={weBlockedThem}
          onClose={() => setProfileOpen(false)}
          onSetNickname={(value) => setNickname(conversationId, currentUser.id, selectedFriend.id, value)}
          onSetTheme={handleSetTheme}
          onToggleMute={() => toggleMute(conversationId, currentUser.id)}
          onToggleReadReceipts={() => toggleReadReceipts(conversationId, currentUser.id)}
          onArchive={() => { toggleArchive(conversationId, currentUser.id); setProfileOpen(false); showToast('Chat archived'); navigate('/chat'); }}
          onDeleteChat={handleDeleteChat}
          onToggleBlock={() => toggleBlock(currentUser.id, selectedFriend.id)}
          onReport={() => {}}
        />
      )}
    </div>
  );
}
