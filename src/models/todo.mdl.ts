import { TodoItemMdl } from './todo-item.mdl';
import { CommentMdl } from './comment.mdl';
import { TodoId, UserId, Username } from 'general-types.ts';

export interface TodoMdl {
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
  comments?: Array<CommentMdl>
  list?: Array<TodoItemMdl>;
}
