import { UserId, Username } from '../types/general-types';

export interface Comment {
  username: Username;
  text: string;
  date: string;
}