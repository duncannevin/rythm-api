import * as passport from 'passport';
import * as LinkedInStrategy from 'passport-linkedin-oauth2';
import * as GitHubStrategy from 'passport-github2';
import * as TwitterStrategy from 'passport-twitter';
import * as GoogleStrategy from 'passport-google-oauth2';
import { default as UserService } from '../services/user.srvc';
import { passportInit } from '../utils/passport-init';
import { linkedin, github, twitter, google } from '../_config';
import { Profile } from 'passport';
import { User } from '../models/user';
import { activationExpiration, activationTokenGen } from '../utils/helpers';

async function oauth1Callback (token, tokenSecret, profile, done) {
  const user: User = {
    display_name: profile.displayName,
    email: profile.emails[0].value,
    user_id: `${profile.provider}|${profile.id}`,
    role: 'guest'
  };
  try {
    user.activationToken = await activationTokenGen();
    user.activationExpires = activationExpiration(); // does nothing at this point (not sure I will ever implement)
    const addedUser = await UserService.updateOrCreate(user);
    done(undefined, addedUser);
  } catch  (error) {
    done(error, undefined);
  }
}

async function oauth2Callback (request, accessToken, refreshToken, profile: Profile, done) {
  const user: User = {
    display_name: profile.displayName,
    email: profile.emails[0].value,
    user_id: `${profile.provider}|${profile.id}`,
    role: 'guest'
  };
  try {
    user.activationToken = await activationTokenGen();
    user.activationExpires = activationExpiration(); // does nothing at this point(not sure I will ever implement)
    const addedUser = await UserService.updateOrCreate(user);
    done(undefined, addedUser);
  } catch  (error) {
    done(error, undefined);
  }
}

/**
 * @description Linkedin oauth
 */
passport.use(new LinkedInStrategy.Strategy({
  clientID: linkedin.LINKEDIN_CLIENT_ID || 'CREATE-A-_config.ts-FILE',
  clientSecret: linkedin.LINKEDIN_CLIENT_SECRET || 'CREATE-A-_config.ts-FILE',
  callbackURL: 'http://localhost:3000/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
}, oauth2Callback));

/**
 * @description Github oauth
 */
passport.use(new GitHubStrategy({
    clientID: github.GITHUB_CLIENT_ID || 'CREATE-A-_config.ts-FILE',
    clientSecret: github.GITHUB_CLIENT_SECRET || 'CREATE-A-_config.ts-FILE',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  }, oauth2Callback));

/**
 * @description Twitter oauth
 */
passport.use(new TwitterStrategy({
    consumerKey: twitter.TWITTER_CLIENT_ID || 'CREATE-A-_config.ts-FILE',
    consumerSecret: twitter.TWITTER_CLIENT_SECRET || 'CREATE-A-_config.ts-FILE',
    callbackURL: 'http://localhost:3000/auth/twitter/callback',
    userProfileURL  : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
  }, oauth1Callback));

/**
 * @description Google oauth
 */
passport.use(new GoogleStrategy.Strategy({
  clientID: google.GOOGLE_CLIENT_ID || 'CREATE-A-_config.ts-FILE',
  clientSecret: google.GOOGLE_CLIENT_SECRET || 'CREATE-A-_config.ts-FILE',
  callbackURL: 'http://localhost:3000/auth/google/callback',
  passReqToCallback: true
}, oauth2Callback));

passportInit();

export default passport;