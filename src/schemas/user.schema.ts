import * as mongoose from 'mongoose';
import * as util from 'util';
import * as uniqId from 'uniqid';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

import { UserMdl } from '../models/user.mdl';

export type UserType = mongoose.Document & UserMdl & {
  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void
};

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  display_name: String,
  user_id: {type: String, unique: true},

  hash: String,
  salt: String,
  role: String,

  active: Boolean,

  liked: [String],
  notLiked: [String],

  passwordResetToken: String,
  passwordResetExpires: Date,

  profile: {
    fname: String,
    lname: String,
    info: String
  }
}, {timestamps: true, versionKey: false});

/**
 * Password hash middleware.
 */
UserSchema.pre('save', function save(next) {
  const user = this;
  user.liked = user.liked || [];
  user.notLiked = user.notLiked || [];
  next();
});

UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.hasOwnProperty('user_id')) {
    user.user_id = uniqId('rythm-');
  }
  next();
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = makeHash(password, this.salt);
}

/**
 * @description Compares encrypted and decrypted passwords
 * @param {string} candidatePassword
 * @returns {boolean}
 */
UserSchema.methods.validatePassword = function (candidatePassword: string) {
  return makeHash(candidatePassword, this.salt) === this.hash;
}

UserSchema.methods.generateJWT = function () {
  return jwtGen({
    fname: this.fname,
    lname: this.lname,
    email: this.email,
    id: this._id,
    role: this.role
  });
}

UserSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    user_id: this.user_id,
    name: this.name,
    email: this.email,
    token: this.generateJWT()
  }
}

type UserType = UserMdl & mongoose.Document;
const UserRepository = mongoose.model<UserType>('UserMdl', UserSchema);
export default UserRepository;

function jwtGen (payload) {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);
  const exp = expirationDate.getTime() / 1000

  return jwt.sign({
    exp,
    ...payload
  }, process.env.SESSION_SECRET)
}

function makeHash (password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');

}
