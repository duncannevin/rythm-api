import { AuthTokenMdl } from './auth-token.mdl';
import { ProfileMdl } from './profile.mdl';
import { TodoId } from '../types/general-types';

export interface UserMdl {

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

  tokens?: Array<AuthTokenMdl>;

  profile?: ProfileMdl;
}