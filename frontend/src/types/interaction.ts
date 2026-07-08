export interface LogComment {
  id: string;
  log_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CreateCommentInput {
  log_id: string;
  user_id: string;
  content: string;
}

export interface LogReaction {
  id: string;
  log_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface ToggleReactionInput {
  log_id: string;
  user_id: string;
  reaction_type: string;
}
