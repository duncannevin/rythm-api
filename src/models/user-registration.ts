import { Email, Name, Password, Role, Username } from '../utils/types';

export interface UserRegistration {
  email: Email;
  password: Password;
  lname: Name;
  fname: Name;
  role: Role;
  username: Username;
}