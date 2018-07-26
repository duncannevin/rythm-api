import { TodoId, UserId, Username } from '../utils/types';

export interface Query {
  todo_id?: TodoId,
  user_id?: UserId,
  search?: string,
  category?: string,
  username?: Username
}