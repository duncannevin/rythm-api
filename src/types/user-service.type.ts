import { UserMdl } from '../models/user.mdl';
import { TodoId, UserId, Username } from '../types/general-types';
import { Model } from 'mongoose';

export interface UserServiceType {
  repository: Model<any>;

  /**
   * @description Finds user by id
   * @param id
   * @return {Promise<UserMdl>}
   */
  findById(id: string): Promise<UserMdl>

  /**
   * @description Fetches single user from the storage by email
   * @param email
   * @returns {Promise<UserMdl>}
   */
  findByEmail(email): Promise<UserMdl>

  findByUsername(username: Username): Promise<UserMdl>

  /**
   * @description Fetches single user from the storage by email or username
   * @param username
   * @param email
   * @returns {Promise<UserMdl>}
   */
  findByUsernameOrEmail(username, email): Promise<UserMdl>

  /**
   * @description Fetches single user by user_id
   * @param {UserId} userId
   * @returns {Promise<UserMdl>}
   */
  findByUserId(userId: UserId): Promise<UserMdl>

  /**
   * @description Saves the user in the storage
   * @param {UserMdl} user
   * @returns {Promise<UserMdl>}
   */
  save(user: UserMdl): Promise<UserMdl>

  /**
   * @description Creates or updates a current user (for social auth)
   * @param {UserMdl} user
   * @return {Promise<UserMdl>}
   */
  updateOrCreate(user: UserMdl): Promise<UserMdl>

  /**
   * @description Removes liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  removeLiked(userId: UserId, todoId: TodoId): Promise<UserMdl>

  /**
   * @description Adds liked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  addLiked(userId: UserId, todoId: TodoId): Promise<UserMdl>

  /**
   * @description Removes notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  removeNotLiked(userId: UserId, todoId: TodoId): Promise<UserMdl>

  /**
   * @description Adds notLiked
   * @param {UserId} userId
   * @param {TodoId} todoId
   * @return {Promise<UserMdl>}
   */
  addNotLiked(userId: UserId, todoId: TodoId): Promise<UserMdl>

  /**
   * @description Fetches all users from the storage
   * @returns {Promise<UserMdl[]>}
   */
  findAll(): Promise<UserMdl[]>

  deleteOne(username: String): Promise<void>
}