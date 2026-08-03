import { useState, useCallback } from 'react';
import { storage, generateId } from '../utils/storage';

/**
 * Central hook for the (lightweight) friends system:
 * sending/accepting/rejecting requests, removing friends, and
 * surfacing "suggested friends" (registered users you're not connected to).
 */
export function useFriends() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  // ---- Friends (accepted, bidirectional) ----
  const getFriendIds = useCallback((userId) => {
    return storage
      .getFriends()
      .filter((f) => f.userA === userId || f.userB === userId)
      .map((f) => (f.userA === userId ? f.userB : f.userA));
  }, [version]);

  const areFriends = useCallback((userIdA, userIdB) => {
    return storage
      .getFriends()
      .some(
        (f) =>
          (f.userA === userIdA && f.userB === userIdB) ||
          (f.userA === userIdB && f.userB === userIdA)
      );
  }, [version]);

  const removeFriend = useCallback((userIdA, userIdB) => {
    storage.setFriends(
      storage
        .getFriends()
        .filter(
          (f) =>
            !(
              (f.userA === userIdA && f.userB === userIdB) ||
              (f.userA === userIdB && f.userB === userIdA)
            )
        )
    );
    bump();
  }, [bump]);

  // ---- Requests ----
  const getIncomingRequests = useCallback((userId) => {
    return storage.getFriendRequests().filter((r) => r.toId === userId && r.status === 'pending');
  }, [version]);

  const getOutgoingRequests = useCallback((userId) => {
    return storage.getFriendRequests().filter((r) => r.fromId === userId && r.status === 'pending');
  }, [version]);

  const getRequestBetween = useCallback((userIdA, userIdB) => {
    return storage
      .getFriendRequests()
      .find(
        (r) =>
          r.status === 'pending' &&
          ((r.fromId === userIdA && r.toId === userIdB) || (r.fromId === userIdB && r.toId === userIdA))
      );
  }, [version]);

  const sendRequest = useCallback((fromId, toId) => {
    const requests = storage.getFriendRequests();
    const exists = requests.some(
      (r) => r.status === 'pending' && r.fromId === fromId && r.toId === toId
    );
    if (exists) return;
    storage.setFriendRequests([
      ...requests,
      { id: generateId('freq'), fromId, toId, status: 'pending', createdAt: new Date().toISOString() },
    ]);
    bump();
  }, [bump]);

  const cancelRequest = useCallback((requestId) => {
    storage.setFriendRequests(storage.getFriendRequests().filter((r) => r.id !== requestId));
    bump();
  }, [bump]);

  const acceptRequest = useCallback((requestId) => {
    const requests = storage.getFriendRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    storage.setFriendRequests(requests.filter((r) => r.id !== requestId));
    storage.setFriends([
      ...storage.getFriends(),
      { id: generateId('frnd'), userA: request.fromId, userB: request.toId, createdAt: new Date().toISOString() },
    ]);
    bump();
  }, [bump]);

  const rejectRequest = useCallback((requestId) => {
    storage.setFriendRequests(storage.getFriendRequests().filter((r) => r.id !== requestId));
    bump();
  }, [bump]);

  // ---- Suggestions (lightweight — used by the RightRail sidebar widget) ----
  // Only "no connection yet" users. Kept separate from getPeopleYouMayKnow below
  // because the sidebar widget only ever wants to show a plain "Add Friend" button —
  // it has no room for Accept/Reject/Request Sent states.
  const getSuggestedUsers = useCallback((currentUserId, limit = 5) => {
    const friendIds = getFriendIds(currentUserId);
    const pendingIds = [
      ...getIncomingRequests(currentUserId).map((r) => r.fromId),
      ...getOutgoingRequests(currentUserId).map((r) => r.toId),
    ];
    return storage
      .getUsers()
      .filter(
        (u) =>
          u.id !== currentUserId &&
          !friendIds.includes(u.id) &&
          !pendingIds.includes(u.id)
      )
      .slice(0, limit);
  }, [version, getFriendIds, getIncomingRequests, getOutgoingRequests]);

  // ---- Relationship status between two users, from userIdA's point of view ----
  // 'self' | 'friends' | 'incoming' (B sent A a request) | 'outgoing' (A sent B a request) | 'none'
  const getRelationshipStatus = useCallback((userIdA, userIdB) => {
    if (userIdA === userIdB) return 'self';
    if (areFriends(userIdA, userIdB)) return 'friends';
    const req = getRequestBetween(userIdA, userIdB);
    if (req) return req.fromId === userIdA ? 'outgoing' : 'incoming';
    return 'none';
  }, [areFriends, getRequestBetween]);

  // ---- Mutual friends: size of the intersection of both users' friend lists ----
  const getMutualFriendsCount = useCallback((userIdA, userIdB) => {
    const friendsA = new Set(getFriendIds(userIdA));
    const friendsB = getFriendIds(userIdB);
    return friendsB.filter((id) => friendsA.has(id)).length;
  }, [getFriendIds]);

  // ---- People You May Know — full suggestions page ----
  // Unlike getSuggestedUsers, this INCLUDES users with a pending request either way,
  // because the /people page needs to render Accept/Reject or "Request Sent" for them
  // (the PDF spec's required sort order depends on it):
  //   1. users who sent the current user a request  (relationship = 'incoming')
  //   2. users with no connection                     (relationship = 'none')
  //   3. users the current user already requested     (relationship = 'outgoing')
  const getPeopleYouMayKnow = useCallback((currentUserId) => {
    const friendIds = getFriendIds(currentUserId);
    const requests = storage.getFriendRequests();

    const order = { incoming: 0, none: 1, outgoing: 2 };

    return storage
      .getUsers()
      .filter((u) => u.id !== currentUserId && !friendIds.includes(u.id))
      .map((u) => {
        const relationship = getRelationshipStatus(currentUserId, u.id);
        const request = requests.find(
          (r) =>
            r.status === 'pending' &&
            ((r.fromId === currentUserId && r.toId === u.id) ||
              (r.fromId === u.id && r.toId === currentUserId))
        );
        return {
          user: u,
          relationship,
          requestId: request?.id ?? null,
          mutualCount: getMutualFriendsCount(currentUserId, u.id),
        };
      })
      .sort((a, b) => order[a.relationship] - order[b.relationship]);
  }, [version, getFriendIds, getRelationshipStatus, getMutualFriendsCount]);

  return {
    version,
    getFriendIds,
    areFriends,
    removeFriend,
    getIncomingRequests,
    getOutgoingRequests,
    getRequestBetween,
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,
    getSuggestedUsers,
    getRelationshipStatus,
    getMutualFriendsCount,
    getPeopleYouMayKnow,
  };
}
