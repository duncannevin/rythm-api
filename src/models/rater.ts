import { UserId } from 'general-types.ts';

export interface Rater {
  user_id: UserId,
  timesRated: number
}