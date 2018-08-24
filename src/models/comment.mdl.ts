import { UserId } from '../types/general-types';

export interface CommentMdl {
  user_id: UserId;
  text: string;
  date: string;
}