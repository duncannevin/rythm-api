import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';
import * as util from 'util';
import { UserMdl } from '../models/user.mdl';
import * as uniqId from 'uniqid';

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
  password: String,
  role: String,

  active: Boolean,

  liked: [String],
  notLiked: [String],

  passwordResetToken: String,
  passwordResetExpires: Date,

  activationToken: String,
  activationExpires: Date,

  profile: {
    fname: String,
    lname: String,
    info: String
  }
}, {timestamps: true});

/**
 * Password hash middleware.
 */
UserSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  if (!user.hasOwnProperty('liked')) {
    user.liked = [];
  }
  if (!user.hasOwnProperty('notLiked')) {
    user.notLiked = [];
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.hasOwnProperty('user_id')) {
    user.user_id = uniqId('rythm-');
  }
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  const qCompare = (util as any).promisify(bcrypt.compare);
  return qCompare(candidatePassword, this.password);
};

type UserType = UserMdl & mongoose.Document;
const UserRepository = mongoose.model<UserType>('UserMdl', UserSchema);
export default UserRepository;