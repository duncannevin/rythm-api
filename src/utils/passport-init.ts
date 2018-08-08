import * as passport from 'passport';
import { default as UserService } from '../services/user.srvc';
import { User } from '../models/user';

export function passportInit () {
  passport.serializeUser(function(user, done) {
    // @ts-ignore
    done(undefined, user.id);
  });

  passport.deserializeUser(async function(id, done) {
    try {
      // @ts-ignore
      const user: User = await UserService.findById(id);
      done(undefined, user);
    } catch (error) {
      done(error, undefined);
    }
  });
}