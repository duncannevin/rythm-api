import { AuthToken } from './auth-token';
import { Profile } from './profile';
import { TodoId } from '../types/general-types';

export interface User {

  email?: string;
  username?: string;
  display_name?: string;
  user_id?: string;

  password?: string;
  role?: string;

  active?: boolean;

  liked?: TodoId[];
  notLiked?: TodoId[];

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  activationToken?: string;
  activationExpires?: Date;

  tokens?: Array<AuthToken>;

  profile?: Profile;
}