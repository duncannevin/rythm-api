import { Raters, Thumbs, TodoId, UserId } from 'general-types.ts';

export interface Rating {
  todo_id: TodoId,
  thumbs: Thumbs,
  raters: Raters
}