import React, { useState } from 'react';
import Link from 'next/link';
import { useFriendships } from '../../hooks/useFriendships';
import { FriendshipService } from '../../services/friendshipService';
import { ProfileService } from '../../services/profileService';
import { Profile } from '../../types/profile';
import styles from './FriendsManager.module.css';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface FriendsManagerProps {
  userId: string;
  friendshipServiceOverride?: FriendshipService;
  profileServiceOverride?: ProfileService;
}

type TabType = 'friends' | 'invites' | 'search';

export const FriendsManager: React.FC<FriendsManagerProps> = ({
  userId,
  friendshipServiceOverride,
  profileServiceOverride,
}) => {
  // Preconditions (DbC)
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (typeof userId !== 'string' || !uuidRegex.test(userId)) {
    throw new Error('User ID must be a valid UUID');
  }

  const {
    friends,
    pendingRequests,
    searchResults,
    loading,
    error: hookError,
    sendRequest,
    acceptRequest,
    declineRequest,
    searchUsers,
    clearSearchResults,
  } = useFriendships(userId, friendshipServiceOverride, profileServiceOverride);

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sentRequestUserIds, setSentRequestUserIds] = useState<string[]>([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSuccessMessage(null);
    
    // Boundary check / Precondition
    if (!searchQuery.trim()) {
      clearSearchResults();
      return;
    }

    try {
      await searchUsers(searchQuery);
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleSendRequest = async (friendId: string, username: string) => {
    setActionError(null);
    setSuccessMessage(null);

    // Preconditions
    if (!friendId || !uuidRegex.test(friendId)) {
      setActionError('Invalid friend ID');
      return;
    }

    try {
      await sendRequest(friendId);
      setSentRequestUserIds(prev => [...prev, friendId]);
      setSuccessMessage(`Bud request sent to @${username}!`);
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to send bud request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string, name: string) => {
    setActionError(null);
    setSuccessMessage(null);

    // Preconditions
    if (!friendshipId || !uuidRegex.test(friendshipId)) {
      setActionError('Invalid friendship ID');
      return;
    }

    try {
      await acceptRequest(friendshipId);
      setSuccessMessage(`You are now buds with ${name}!`);
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept bud request');
    }
  };

  const handleDeclineRequest = async (friendshipId: string, name: string) => {
    setActionError(null);
    setSuccessMessage(null);

    // Preconditions
    if (!friendshipId || !uuidRegex.test(friendshipId)) {
      setActionError('Invalid friendship ID');
      return;
    }

    try {
      await declineRequest(friendshipId);
      setSuccessMessage(`Declined bud request from ${name}.`);
    } catch (err: any) {
      setActionError(err instanceof Error ? err.message : 'Failed to decline bud request');
    }
  };

  const getInitials = (displayName: string | null, username: string) => {
    const name = displayName || username;
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const displayedError = actionError || hookError;

  return (
    <div className={styles.container} data-testid="friends-manager">
      <header className={styles.header}>
        <h1 className={styles.title}>Sprout Social</h1>
        <p className={styles.subtitle}>Connect with your buds and grow your habits together</p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'friends' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('friends');
            setSuccessMessage(null);
            setActionError(null);
          }}
          data-testid="tab-friends"
        >
          Buds
          {friends.length > 0 && <span className={styles.badge}>{friends.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'invites' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('invites');
            setSuccessMessage(null);
            setActionError(null);
          }}
          data-testid="tab-invites"
        >
          Invites
          {pendingRequests.length > 0 && (
            <span className={styles.badge} data-testid="invites-count">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'search' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveTab('search');
            setSuccessMessage(null);
            setActionError(null);
          }}
          data-testid="tab-search"
        >
          Find Buds
        </button>
      </nav>

      {displayedError && (
        <div className={`${styles.statusMessage} ${styles.error}`} data-testid="error-message">
          {displayedError}
        </div>
      )}

      {successMessage && (
        <div className={`${styles.statusMessage} styleSuccess`} data-testid="success-message" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px'
        }}>
          {successMessage}
        </div>
      )}

      {loading && (
        <div className={styles.loading} data-testid="loading-indicator">
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className={styles.list} data-testid="friends-list">
          {friends.length === 0 ? (
            <div className={styles.emptyState}>No buds added yet. Go find some buds!</div>
          ) : (
            friends.map(friend => (
              <div key={friend.friendshipId} className={styles.item} data-testid="friend-item">
                <Link href={`/forest/${friend.profile.username}`} className={styles.friendLink} style={{ display: 'flex', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.userInfo}>
                    {friend.profile.avatar_url ? (
                      <img
                        src={friend.profile.avatar_url}
                        alt={friend.profile.username}
                        className={styles.avatar}
                        data-testid="friend-avatar"
                      />
                    ) : (
                      <div className={styles.avatarFallback} data-testid="friend-avatar-fallback">
                        {getInitials(friend.profile.display_name, friend.profile.username)}
                      </div>
                    )}
                    <div className={styles.userDetails}>
                      <span className={styles.displayName} data-testid="friend-display-name">
                        {friend.profile.display_name || friend.profile.username}
                      </span>
                      <span className={styles.username} data-testid="friend-username">
                        @{friend.profile.username}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'invites' && (
        <div className={styles.list} data-testid="invites-list">
          {pendingRequests.length === 0 ? (
            <div className={styles.emptyState}>No pending invitations.</div>
          ) : (
            pendingRequests.map(invite => (
              <div key={invite.friendshipId} className={styles.item} data-testid="invite-item">
                <div className={styles.userInfo}>
                  {invite.profile.avatar_url ? (
                    <img
                      src={invite.profile.avatar_url}
                      alt={invite.profile.username}
                      className={styles.avatar}
                      data-testid="invite-avatar"
                    />
                  ) : (
                    <div className={styles.avatarFallback} data-testid="invite-avatar-fallback">
                      {getInitials(invite.profile.display_name, invite.profile.username)}
                    </div>
                  )}
                  <div className={styles.userDetails}>
                    <span className={styles.displayName} data-testid="invite-display-name">
                      {invite.profile.display_name || invite.profile.username}
                    </span>
                    <span className={styles.username} data-testid="invite-username">
                      @{invite.profile.username}
                    </span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.actionButton}`}
                    onClick={() =>
                      handleAcceptRequest(
                        invite.friendshipId,
                        invite.profile.display_name || invite.profile.username
                      )
                    }
                    data-testid="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    className={`${styles.button} ${styles.dangerButton} ${styles.actionButton}`}
                    onClick={() =>
                      handleDeclineRequest(
                        invite.friendshipId,
                        invite.profile.display_name || invite.profile.username
                      )
                    }
                    data-testid="decline-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div className={styles.searchSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.input}
              data-testid="search-input"
            />
            <button type="submit" className={styles.button} data-testid="search-button">
              Search
            </button>
          </form>

          <div className={`${styles.list} ${styles.searchSection}`} data-testid="search-results" style={{ marginTop: '20px' }}>
            {searchResults.length === 0 ? (
              searchQuery.trim() && !loading ? (
                <div className={styles.emptyState}>No users found.</div>
              ) : null
            ) : (
              searchResults.map(profile => {
                const isAlreadyFriend = friends.some(f => f.profile.id === profile.id);
                const hasPendingInvite = pendingRequests.some(f => f.profile.id === profile.id);
                const requestSent = sentRequestUserIds.includes(profile.id);

                return (
                  <div key={profile.id} className={styles.item} data-testid="search-result-item">
                    <div className={styles.userInfo}>
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className={styles.avatar}
                          data-testid="search-result-avatar"
                        />
                      ) : (
                        <div className={styles.avatarFallback} data-testid="search-result-avatar-fallback">
                          {getInitials(profile.display_name, profile.username)}
                        </div>
                      )}
                      <div className={styles.userDetails}>
                        <span className={styles.displayName} data-testid="search-result-display-name">
                          {profile.display_name || profile.username}
                        </span>
                        <span className={styles.username} data-testid="search-result-username">
                          @{profile.username}
                        </span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      {isAlreadyFriend ? (
                        <button className={`${styles.button} ${styles.actionButton}`} disabled data-testid="status-friend">
                          Friend
                        </button>
                      ) : hasPendingInvite ? (
                        <button className={`${styles.button} ${styles.actionButton}`} disabled data-testid="status-pending">
                          Pending Approval
                        </button>
                      ) : requestSent ? (
                        <button className={`${styles.button} ${styles.actionButton}`} disabled data-testid="status-sent">
                          Sent
                        </button>
                      ) : (
                        <button
                          className={`${styles.button} ${styles.actionButton}`}
                          onClick={() => handleSendRequest(profile.id, profile.username)}
                          data-testid="send-request-btn"
                        >
                          Add Bud
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
