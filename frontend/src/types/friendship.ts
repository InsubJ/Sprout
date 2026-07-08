export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

export interface SendFriendshipRequestInput {
  user_id: string;
  friend_id: string;
}
