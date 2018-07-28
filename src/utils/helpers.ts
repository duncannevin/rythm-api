import * as jwt from 'jsonwebtoken';
import { User } from '../models/user';

export const jwtPayload = (req): User => {
  const tokenHeader = req.headers.Authorization || req.headers.authorization;
  const token = (tokenHeader as string).split(' ')[1];
  return (jwt.decode(token) as User);
};