import * as jwt from 'jsonwebtoken';
import { UserMdl } from '../models/user.mdl';
import * as util from 'util';
import * as crypto from 'crypto';

export function jwtPayload (req): UserMdl {
  const tokenHeader = req.headers.Authorization || req.headers.authorization;
  const token = (tokenHeader as string).split(' ')[1];
  return (jwt.decode(token) as UserMdl);
}

export async function activationTokenGen(): Promise<string> {
  const qRandomBytes = (util as any).promisify(crypto.randomBytes);
  const cryptedValue = await qRandomBytes(16);
  return cryptedValue.toString('hex');
}

export function activationExpiration () {
  return new Date(Date.now() + 3600000); // 1 hour
}