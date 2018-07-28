import { TodoId, UserId } from './general-types';

export interface IncrementThumbs {
  rater_id: UserId,
  todo_id: TodoId,
  direction: number
}