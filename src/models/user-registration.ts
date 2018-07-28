import { Email, Name, Password, Role, Username } from 'general-types.ts';

export interface UserRegistration {
  email: Email;
  password: Password;
  lname: Name;
  fname: Name;
  role: Role;
  username: Username;
}