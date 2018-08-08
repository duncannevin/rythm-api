import { User } from '../models/user';
import * as bcrypt from 'bcrypt-nodejs';
import * as util from 'util';
import UserRepository, { UserType } from '../schemas/user.schema';
import { TodoId, UserId } from '../types/general-types';

/**
 * @class UserService
 */
class UserService {
  /**
   * @description Finds user by id
   * @param id
   * @return {Promise<User>}
   */
    async findById(id: string): Promise<User> {
      return await UserRepository.findById(id);
  }

  /**
   * @description Fetches single user from the storage by email
   * @param email
   * @returns {Promise<User>}
   */
  async findByEmail(email): Promise<User> {
    const user: UserType = await UserRepository.findOne({email: email});
    return user;
  }

  /**
   * @description Fetches single user from the storage by email or username
   * @param username
   * @param email
   * @returns {Promise<User>}
   */
  async findByUsernameOrEmail(username, email): Promise<User> {
    const user: User = await UserRepository.findOne({$or: [{email: email}, {username: username}]});
    return user;
  }

  /**
   * @description Fetches single user by user_id
   * @param {UserId} userId
   * @returns {Promise<User>}
   */
  async findByUserId(userId: UserId): Promise<User> {
    return await UserRepository.findOne({user_id: userId});
  }

  /**
   * @description Saves the user in the storage
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user: User): Promise<User> {
    return (await new UserRepository(user).save()).toObject({ virtuals: true });
  }

  /**
   * @description Fetches single user by activationToken and sets active flag
   * @param activationToken
   * @returns {Promise<User>}
   */
  async activateUser(activationToken): Promise<User> {
    const user: User = await UserRepository.findOneAndUpdate({activationToken: activationToken}, {active: true}, {new: true});
    return user;
  }

  /**
   * @description Creates or updates a current user (for social auth)
   * @param {User} user
   * @return {Promise<User>}
   */
  async updateOrCreate(user: User): Promise<User> {
    return (await UserRepository.findOneAndUpdate({user_id: user.user_id}, user, {upsert: true, new: true}));
  }

  /**
   * @description Removes liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<User>}
   */
  async removeLiked(userId: UserId, todoId: TodoId): Promise<User> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$pull: {liked: todoId}}, {new: true}));
  }

  /**
   * @description Adds liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<User>}
   */
  async addLiked(userId: UserId, todoId: TodoId): Promise<User> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$push: {liked: todoId}}, {new: true}));
  }

  /**
   * @description Removes notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<User>}
   */
  async removeNotLiked(userId: UserId, todoId: TodoId): Promise<User> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$pull: {notLiked: todoId}}, {new: true}));
  }

  /**
   * @description Adds notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<User>}
   */
  async addNotLiked(userId: UserId, todoId: TodoId): Promise<User> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$push: {notLiked: todoId}}, {new: true}));
  }

  /**
   * @description Fetches all users from the storage
   * @returns {Promise<User[]>}
   */
  async findAll(): Promise<User[]> {
    return await UserRepository.find() as User[];
  }

  async deleteOne(username: String): Promise<void> {
    return await UserRepository.deleteOne({username: username});
  }

  /**
   * @description Compares encrypted and decrypted passwords
   * @param {string} candidatePassword
   * @param storedPassword
   * @returns {boolean}
   */
  comparePassword(candidatePassword: string, storedPassword): boolean {
    const qCompare = (util as any).promisify(bcrypt.compare);
    return qCompare(candidatePassword, storedPassword);
  }
}

export default new UserService();