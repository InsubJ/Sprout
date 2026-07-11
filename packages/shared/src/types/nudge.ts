export interface WitherNudge {
  id: string;
  sender_id: string;
  receiver_id: string;
  habit_id: string;
  nudged_at: string; // YYYY-MM-DD
  created_at: string;
}

export interface SendNudgeInput {
  sender_id: string;
  receiver_id: string;
  habit_id: string;
}
