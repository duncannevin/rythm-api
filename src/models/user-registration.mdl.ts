import { Email, Name, Password, Role, Username } from 'general-types.ts';

export interface UserRegistrationMdl {
  email: Email;
  password: Password;
  lname: Name;
  fname: Name;
  role: Role;
  username: Username;
}