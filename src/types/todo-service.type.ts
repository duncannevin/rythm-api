import { Model } from 'mongoose';

import { TodoId, UserId, Username } from 'general-types.ts';
import { TodoMdl } from '../models/todo.mdl';
import { QueryMdl } from '../models/query.mdl';
import { CommentMdl } from '../models/comment.mdl';

export interface TodoServiceType {
  repository: Model<any>;

  /**
   * @description saves TodoMdl to storage
   * @param {TodoMdl} todo
   * @return {Promise<TodoMdl>}
   */
  save(todo: TodoMdl): Promise<TodoMdl>

  /**
   * @description fetches all Todos from storage
   * @return {Promise<TodoMdl[]>}
   */
  fetchAll(): Promise<TodoMdl[]>

  /**
   * @description gets Todos based on a full text search
   * @param {string} searchString
   * @param {object} query
   * @return {Promise<TodoMdl[]>}
   */
  searchRepository(searchString: string, query: QueryMdl): Promise<TodoMdl[]>

  /**
   * @description queries Todos
   * @param {object} query
   * @return {Promise<TodoMdl[]>}
   */
  queryRepository(query: QueryMdl): Promise<TodoMdl[]>

  /**
   * @description finds a single TodoMdl by id
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  findOne(todoId: TodoId): Promise<TodoMdl>

  /**
   * @description increment thumbs_up
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  thumbUp(todoId: TodoId): Promise<TodoMdl>

  /**
   * @description increment thumbs_down
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  thumbDown(todoId: TodoId): Promise<TodoMdl>

  /**
   * @description increment thumbs_up
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  decrementThumbUp(todoId: TodoId): Promise<TodoMdl>

  /**
   * @description decrement thumbs_down
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  decrementThumbDown(todoId: TodoId): Promise<TodoMdl> 

  /**
   * @description insert comments into TodoMdl comment array
   * @param {TodoId} todoId
   * @param {Promise<TodoMdl>} comment
   */
  insertComment(todoId: TodoId, comment: CommentMdl): Promise<TodoMdl>

  /**
   * @description inserts multiple Todos
   * @param {TodoMdl[]} todos
   * @return {Promise<void>}
   */
  insertMany(todos: TodoMdl[]): Promise<TodoMdl[]>

  /**
   * @description updates a TodoMdl in storage
   */
  updateOne(todo: TodoMdl): Promise<TodoMdl>

  /**
   * @description deletes a single TodoMdl from storage
   */
  deleteOne(todoId: TodoId): Promise<void>

  deleteMany(todoIds: TodoId[]): Promise<void>

  /**
   * @description deletes all of a users Todos
   */
  deleteUsersTodos(username: Username): Promise<void>
}