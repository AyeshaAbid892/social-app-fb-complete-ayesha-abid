// utils/seedDemoData.js
// Populates localStorage with a small, realistic demo dataset the very
// first time the app runs on a machine (i.e. when there are zero users in
// storage) so every workflow — chat, AI suggestions, personalities,
// auto-reply, comment suggestions, friends — can be tested immediately
// after `npm run dev`, without manually signing up and befriending a second
// account first.
//
// This NEVER runs again once any user exists — it's a first-run convenience
// only, not a reset button, and it never touches real user data.
import { storage, generateId } from './storage';

const DEMO_PASSWORD = 'Demo1234';

export function seedDemoDataIfEmpty() {
  if (storage.getUsers().length > 0) return; // already seeded, or a real user signed up

  const now = Date.now();
  const iso = (offsetMs) => new Date(now + offsetMs).toISOString();

  // ---- Users ----
  // "Asad Khan" is the account you land on already logged in — it's the
  // account every AI feature (suggestions, personalities, auto-reply,
  // comment suggestions) should be tested from.
  const asad = {
    id: generateId('usr'),
    name: 'Asad Khan',
    email: 'asad@demo.com',
    password: DEMO_PASSWORD,
    bio: 'Building things with React. Coffee-powered. ☕',
    location: 'Lahore, Pakistan',
    avatar: null,
    coverImage: null,
    bookmarks: [],
    profession: 'Frontend Developer',
    work: 'SocialConnect Labs',
    education: '',
    relationshipStatus: '',
    website: '',
    phone: '',
    birthday: '',
    onboarded: true,
    joinedAt: iso(-1000 * 60 * 60 * 24 * 120),
  };
  const ayesha = {
    id: generateId('usr'),
    name: 'Ayesha Abid',
    email: 'ayesha@demo.com',
    password: DEMO_PASSWORD,
    bio: 'Designer, dreamer, dog person 🐾',
    location: 'Karachi, Pakistan',
    avatar: null,
    coverImage: null,
    bookmarks: [],
    profession: 'Product Designer',
    work: 'Pixel Studio',
    education: '',
    relationshipStatus: '',
    website: '',
    phone: '',
    birthday: '',
    onboarded: true,
    joinedAt: iso(-1000 * 60 * 60 * 24 * 200),
  };
  const bilal = {
    id: generateId('usr'),
    name: 'Bilal Hussain',
    email: 'bilal@demo.com',
    password: DEMO_PASSWORD,
    bio: 'Photographer 📸 | Travel enthusiast',
    location: 'Islamabad, Pakistan',
    avatar: null,
    coverImage: null,
    bookmarks: [],
    profession: 'Photographer',
    work: 'Freelance',
    education: '',
    relationshipStatus: '',
    website: '',
    phone: '',
    birthday: '',
    onboarded: true,
    joinedAt: iso(-1000 * 60 * 60 * 24 * 90),
  };
  const sara = {
    id: generateId('usr'),
    name: 'Sara Malik',
    email: 'sara@demo.com',
    password: DEMO_PASSWORD,
    bio: 'Bookworm 📚 | Chai over coffee',
    location: 'Lahore, Pakistan',
    avatar: null,
    coverImage: null,
    bookmarks: [],
    profession: 'Content Writer',
    work: 'WordSmith Co.',
    education: '',
    relationshipStatus: '',
    website: '',
    phone: '',
    birthday: '',
    onboarded: true,
    joinedAt: iso(-1000 * 60 * 60 * 24 * 60),
  };

  storage.setUsers([asad, ayesha, bilal, sara]);

  // ---- Friends ----
  // Asad <-> Ayesha and Asad <-> Bilal are already friends (so chat + AI
  // features work immediately); Sara is left as a pending/suggested contact
  // so the Friends/People workflows have something to test too.
  storage.setFriends([
    { userA: asad.id, userB: ayesha.id, since: iso(-1000 * 60 * 60 * 24 * 30) },
    { userA: asad.id, userB: bilal.id, since: iso(-1000 * 60 * 60 * 24 * 10) },
  ]);
  storage.setFriendRequests([
    { id: generateId('freq'), fromId: sara.id, toId: asad.id, createdAt: iso(-1000 * 60 * 60 * 5) },
  ]);

  // ---- Posts ----
  const posts = [
    {
      id: generateId('post'),
      authorId: ayesha.id,
      description: 'Just redesigned our whole onboarding flow — feels so much cleaner now 🎨 Excited to ship it!',
      image: null,
      isPublic: true,
      isDraft: false,
      createdAt: iso(-1000 * 60 * 60 * 6),
      updatedAt: iso(-1000 * 60 * 60 * 6),
    },
    {
      id: generateId('post'),
      authorId: bilal.id,
      description: 'Caught this sunrise over the mountains this morning. Totally worth the 4am wake-up call.',
      image: null,
      isPublic: true,
      isDraft: false,
      createdAt: iso(-1000 * 60 * 60 * 26),
      updatedAt: iso(-1000 * 60 * 60 * 26),
    },
    {
      id: generateId('post'),
      authorId: asad.id,
      description: "Finally shipped the AI reply assistant feature I've been working on all week. Small team, big win 🚀",
      image: null,
      isPublic: true,
      isDraft: false,
      createdAt: iso(-1000 * 60 * 60 * 3),
      updatedAt: iso(-1000 * 60 * 60 * 3),
    },
  ];
  storage.setPosts(posts);
  storage.setComments([
    {
      id: generateId('cmt'),
      postId: posts[0].id,
      authorId: bilal.id,
      text: 'The new flow looks so much smoother, nice work!',
      createdAt: iso(-1000 * 60 * 60 * 5),
    },
  ]);

  // ---- Chat: a short, realistic history between Asad and Ayesha, so the
  // AI reply-suggestion / personality / auto-reply / "Reply" menu features
  // all have something to work with immediately. ----
  const conversationId = [asad.id, ayesha.id].sort().join('_');
  const messages = [
    {
      id: generateId('msg'),
      conversationId,
      senderId: ayesha.id,
      receiverId: asad.id,
      type: 'text',
      content: 'Hey Asad! How has your week been?',
      timestamp: iso(-1000 * 60 * 45),
      read: true,
      aiGenerated: false,
      replyToId: null,
      pinned: false,
      deletedFor: [],
      reactions: {},
    },
    {
      id: generateId('msg'),
      conversationId,
      senderId: asad.id,
      receiverId: ayesha.id,
      type: 'text',
      content: 'Pretty busy, been heads-down shipping the new AI features! Yours?',
      timestamp: iso(-1000 * 60 * 42),
      read: true,
      aiGenerated: false,
      replyToId: null,
      pinned: false,
      deletedFor: [],
      reactions: {},
    },
    {
      id: generateId('msg'),
      conversationId,
      senderId: ayesha.id,
      receiverId: asad.id,
      type: 'text',
      content: 'Feeling great! Just wrapped up the onboarding redesign — want to grab coffee this weekend and catch up?',
      timestamp: iso(-1000 * 60 * 5),
      read: false,
      aiGenerated: false,
      replyToId: null,
      pinned: false,
      deletedFor: [],
      reactions: {},
    },
  ];
  storage.setMessages(messages);

  // ---- Auto-login as the demo "self" account so the app is immediately
  // usable without a manual signup/login step. ----
  const { password: _password, ...safeAsad } = asad;
  storage.setCurrentUser(safeAsad);
}
