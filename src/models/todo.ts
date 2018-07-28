import { TodoItem } from './todo-item';
import { Thumbs, TodoId, UserId, Username } from 'general-types.ts';

export interface Todo {
  user_id?: UserId;
  username?: Username;
  todo_id?: TodoId;
  master?: boolean;
  master_id?: TodoId;
  thumbs?: Thumbs,
  private?: boolean;
  title?: string;
  description?: string;
  category?: string;
  list?: Array<TodoItem>;
}
