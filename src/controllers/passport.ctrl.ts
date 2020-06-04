import * as passport from 'passport';
import { PassportStatic, Profile } from 'passport';
import * as LinkedInStrategy from 'passport-linkedin-oauth2';
import * as GitHubStrategy from 'passport-github2';
import * as TwitterStrategy from 'passport-twitter';
import * as GoogleStrategy from 'passport-google-oauth2';
import * as LocalStrategy from 'passport-local';
import { inject, autoInjectable, singleton } from 'tsyringe';

import { UserService } from '../services/user.srvc';
import { UserMdl } from '../models/user.mdl';
import { authLogger } from '../utils/loggers.utl';
import { PassportControlType } from 'passport-ctrl.type';

@singleton()
@autoInjectable()
export class PassportControl implements PassportControlType {
  passport: PassportStatic;
  authenticate: any;

  constructor (
    @inject('UserServiceType') private userService?: UserService
  ) {
    this._localAuthCallback = this._localAuthCallback.bind(this);
    this._oauth1Callback = this._oauth1Callback.bind(this);
    this._oauth2Callback = this._oauth2Callback.bind(this);
    this._passportInit = this._passportInit.bind(this);
    this._initialize = this._initialize.bind(this);

    this._passportInit();
    this._initialize();
  }

  private _passportInit (): void {
    const userService = this.userService;

    passport.serializeUser(function(user, done) {
      // @ts-ignore
      done(undefined, user.id);
    });

    passport.deserializeUser(async function(id, done) {
      try {
        // @ts-ignore
        const user: UserMdl = await userService.findById(id);
        done(undefined, user);
      } catch (error) {
        done(error, undefined);
      }
    });
  }

  private async _oauth1Callback (token, tokenSecret, profile: Profile, done): Promise<any> {
    const user: UserMdl = {
      display_name: profile.displayName,
      email: profile.emails[0].value,
      user_id: `${profile.provider}-${profile.id}`,
      role: 'guest'
    };
    try {
      const addedUser = await this.userService.updateOrCreate(user);
      authLogger.info('oauth1 successful', profile.provider);
      done(undefined, addedUser);
    } catch  (error) {
      authLogger.debug('oauth1 failed', profile.provider, error);
      done(error, undefined);
    }
  }

  private async _oauth2Callback (request, accessToken, refreshToken, profile: Profile, done): Promise<any> {
    const user: UserMdl = {
      display_name: profile.displayName,
      email: profile.emails[0].value,
      user_id: `${profile.provider}-${profile.id}`,
      role: 'guest'
    };
    try {
      const addedUser = await this.userService.updateOrCreate(user);
      authLogger.info('oauth2 successful', profile.provider);
      done(undefined, addedUser);
    } catch  (error) {
      authLogger.debug('oauth2 failed', profile.provider, error);
      done(error, undefined);
    }
  }

  private async _localAuthCallback (email, password, done) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !user.validatePassword(password)) {
        return done(undefined, false, { error: { 'email or passord': 'is invalid' }});
      }
      return done(undefined, user);
    } catch (error) {
      authLogger.debug('local auth failed', error);
      done(error, undefined);
    }
  }
  

  private _initialize(): void {
    this._initLocal();

    this.passport = passport;
    this.authenticate = this.passport.authenticate.bind(passport);
  }

  private _initLocal() {
    /**
     * @description Local auth
     */
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, this._localAuthCallback));
  }

  private _initLinkedIn() {
    /**
     * @description Linkedin oauth
     */
    passport.use(new LinkedInStrategy.Strategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_basicprofile'],
      state: true
    }, this._oauth2Callback));
  }

  private _initGithub() {
    /**
     * @description Github oauth
     */
    passport.use(new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/github/callback'
      }, this._oauth2Callback));
  }

  private _initTwitter() {
    /**
     * @description Twitter oauth
     */
    passport.use(new TwitterStrategy({
        consumerKey: process.env.CLIENT_ID,
        consumerSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/twitter/callback',
        userProfileURL  : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      }, this._oauth1Callback));
  }

  private _initGoogle() {
    /**
     * @description Google oauth
     */
    passport.use(new GoogleStrategy.Strategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true
    }, this._oauth2Callback));
  }
}
