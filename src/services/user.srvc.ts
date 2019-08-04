import { UserMdl } from '../models/user.mdl';
import * as bcrypt from 'bcrypt-nodejs';
import * as util from 'util';
import UserRepository, { UserType } from '../schemas/user.schema';
import { TodoId, UserId, Username } from '../types/general-types';
import { UserServiceType } from '../types/user-service.type';
import { singleton } from 'tsyringe';
import { Model } from 'mongoose';

/**
 * @class UserService
 */
@singleton()
export class UserService implements UserServiceType {
  repository: Model<UserType>;

  constructor (repository: Model<UserType> = UserRepository) {
    this.repository = repository;
  }

  /**
   * @description Finds user by id
   * @param id
   * @return {Promise<UserMdl>}
   */
    async findById(id: string): Promise<UserMdl> {
      return await UserRepository.findById(id);
  }

  /**
   * @description Fetches single user from the storage by email
   * @param email
   * @returns {Promise<UserMdl>}
   */
  async findByEmail(email): Promise<UserMdl> {
    const user: UserType = await UserRepository.findOne({email: email});
    return user;
  }

  async findByUsername(username: Username): Promise<UserMdl> {
    const user: UserType = await UserRepository.findOne({username: username});
    return user;
  }

  /**
   * @description Fetches single user from the storage by email or username
   * @param username
   * @param email
   * @returns {Promise<UserMdl>}
   */
  async findByUsernameOrEmail(username, email): Promise<UserMdl> {
    const user: UserMdl = await UserRepository.findOne({$or: [{email: email}, {username: username}]});
    return user;
  }

  /**
   * @description Fetches single user by user_id
   * @param {UserId} userId
   * @returns {Promise<UserMdl>}
   */
  async findByUserId(userId: UserId): Promise<UserMdl> {
    return await UserRepository.findOne({user_id: userId});
  }

  /**
   * @description Saves the user in the storage
   * @param {UserMdl} user
   * @returns {Promise<UserMdl>}
   */
  async save(user: UserMdl): Promise<UserMdl> {
    const newUser = new UserRepository(user);
    newUser.setPassword(user.password);
    return await newUser.save();
  }

  /**
   * @description Creates or updates a current user (for social auth)
   * @param {UserMdl} user
   * @return {Promise<UserMdl>}
   */
  async updateOrCreate(user: UserMdl): Promise<UserMdl> {
    return (await UserRepository.findOneAndUpdate({user_id: user.user_id}, user, {upsert: true, new: true}));
  }

  /**
   * @description Removes liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  async removeLiked(userId: UserId, todoId: TodoId): Promise<UserMdl> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$pull: {liked: todoId}}, {new: true}));
  }

  /**
   * @description Adds liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  async addLiked(userId: UserId, todoId: TodoId): Promise<UserMdl> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$push: {liked: todoId}}, {new: true}));
  }

  /**
   * @description Removes notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  async removeNotLiked(userId: UserId, todoId: TodoId): Promise<UserMdl> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$pull: {notLiked: todoId}}, {new: true}));
  }

  /**
   * @description Adds notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  async addNotLiked(userId: UserId, todoId: TodoId): Promise<UserMdl> {
    return (await UserRepository.findOneAndUpdate({user_id: userId}, {$push: {notLiked: todoId}}, {new: true}));
  }

  /**
   * @description Fetches all users from the storage
   * @returns {Promise<UserMdl[]>}
   */
  async findAll(): Promise<UserMdl[]> {
    return await UserRepository.find() as UserMdl[];
  }

  async deleteOne(username: String): Promise<void> {
    return await UserRepository.deleteOne({username: username});
  }
}
