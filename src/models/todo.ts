import { TodoItem } from './todo-item';
import { TodoId, UserId, Username } from 'general-types.ts';

export interface Todo {
  user_id?: UserId;
  username?: Username;
  todo_id?: TodoId;
  master?: boolean;
  master_id?: TodoId;
  thumbs_up?: number,
  thumbs_down?: number,
  private?: boolean;
  title?: string;
  description?: string;
  category?: string;
  list?: Array<TodoItem>;
}
