import { AuthTokenMdl } from './auth-token.mdl';
import { ProfileMdl } from './profile.mdl';
import { TodoId } from '../types/general-types';

export interface UserMdl {

  email?: string;
  username?: string;
  display_name?: string;
  user_id?: string;

  password?: string;

  hash?: string;
  salt?: string;
  role?: string;

  active?: boolean;

  liked?: TodoId[];
  notLiked?: TodoId[];

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  tokens?: Array<AuthTokenMdl>;

  profile?: ProfileMdl;

  toAuthJSON?: () => any;
  generateJWT?: () => any;
  validatePassword?: (candidatePassword: string) => any;
  setPassword?: (password: string) => void;
}