import type { CreateCommentInput, LogComment, LogReaction, ToggleReactionInput } from '@sprout/shared';
export interface InteractionRepository { getComments(logId: string): Promise<LogComment[]>; createComment(input: CreateCommentInput): Promise<LogComment>; getReactions(logId: string): Promise<LogReaction[]>; toggleReaction(input: ToggleReactionInput): Promise<LogReaction | null>; }
