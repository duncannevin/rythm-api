import { TodoId, UserId, Username } from 'general-types.ts';

export interface QueryMdl {
  todo_id?: TodoId,
  user_id?: UserId,
  search?: string,
  category?: string,
  username?: Username
}