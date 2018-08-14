import { UserId } from '../types/general-types';

export interface Comment {
  user_id: UserId;
  text: string;
  date: string;
}