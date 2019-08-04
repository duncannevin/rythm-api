import { TodoMdl } from '../models/todo.mdl';
import TodoRepository, { TodoType } from '../schemas/todo.schema';
import { TodoId, Username } from 'general-types.ts';
import { QueryMdl } from '../models/query.mdl';
import { CommentMdl } from '../models/comment.mdl';
import { TodoServiceType } from '../types/todo-service.type';
import { singleton } from 'tsyringe';
import { Model } from 'mongoose';
import { UserId } from 'aws-sdk/clients/lexruntime';

/**
 * @class TodoService
 */
@singleton()
export class TodoService implements TodoServiceType {
  repository: Model<TodoType>;

  constructor (repository: Model<TodoType> = TodoRepository) {
    this.repository = repository;
  }

  /**
   * @description saves TodoMdl to storage
   * @param {TodoMdl} todo
   * @return {Promise<TodoMdl>}
   */
  async save(todo: TodoMdl): Promise<TodoMdl> {
    return await new this.repository(todo).save();
  }

  /**
   * @description fetches all Todos from storage
   * @return {Promise<TodoMdl[]>}
   */
  async fetchAll(): Promise<TodoMdl[]> {
    return await this.repository.find() as TodoMdl[];
  }

  /**
   * @description gets Todos based on a full text search
   * @param {string} searchString
   * @param {object} query
   * @return {Promise<TodoMdl[]>}
   */
  async searchRepository(searchString: string, query: QueryMdl): Promise<TodoMdl[]> {
   return await this.repository
     .find({$and: [{$text: {$search: searchString}}, query]}, {score: {$meta: 'textScore'}})
     .sort({score: {$meta: 'textScore'}}) as TodoMdl[];
  }

  /**
   * @description queries Todos
   * @param {object} query
   * @return {Promise<TodoMdl[]>}
   */
  async queryRepository(query: QueryMdl): Promise<TodoMdl[]> {
    return await this.repository.find(query) as TodoMdl[];
  }

  /**
   * @description finds a single TodoMdl by id
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  async findOne(todoId: TodoId): Promise<TodoMdl> {
    const todo = await this.repository.find({todo_id: todoId});
    return todo[0] as TodoMdl;
  }

  /**
   * @description increment thumbs_up
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  async thumbUp(todoId: TodoId): Promise<TodoMdl> {
    return (await this.repository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_up: 1}}, {new: true}));
  }

  /**
   * @description increment thumbs_down
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  async thumbDown(todoId: TodoId): Promise<TodoMdl> {
    return (await this.repository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_down: 1}}, {new: true}));
  }

  /**
   * @description increment thumbs_up
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  async decrementThumbUp(todoId: TodoId): Promise<TodoMdl> {
    return (await this.repository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_up: -1}}, {new: true}));
  }

  /**
   * @description decrement thumbs_down
   * @param {TodoId} todoId
   * @return {Promise<TodoMdl>}
   */
  async decrementThumbDown(todoId: TodoId): Promise<TodoMdl> {
    return (await this.repository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_down: -1}}, {new: true}));
  }

  /**
   * @description insert comments into TodoMdl comment array
   * @param {TodoId} todoId
   * @param {Promise<TodoMdl>} comment
   */
  async insertComment(todoId: TodoId, comment: CommentMdl): Promise<TodoMdl> {
    comment.date = new Date().toString();
    return (await this.repository.findOneAndUpdate({todo_id: todoId}, {$push: {comments: comment}}, {new: true}));
  }

  /**
   * @description inserts multiple Todos
   * @param {TodoMdl[]} todos
   * @return {Promise<void>}
   */
  async insertMany(todos: TodoMdl[]): Promise<TodoMdl[]> {
    return await this.repository.create(todos) as TodoMdl[];
  }

  /**
   * @description updates a TodoMdl in storage
   */
  async updateOne(todo: TodoMdl): Promise<TodoMdl> {
    return (await this.repository.findOneAndUpdate({todo_id: todo.todo_id}, {$set: todo}, {new: true}));
  }

  /**
   * @description deletes a single TodoMdl from storage
   */
  async deleteOne(todoId: TodoId): Promise<void> {
    return await this.repository.deleteOne({todo_id: todoId});
  }

  async deleteMany(todoIds: TodoId[]): Promise<void> {
    return (await this.repository.deleteMany({todo_id: {$in: todoIds}}));
  }

  /**
   * @description deletes all of a users Todos
   */
  async deleteUsersTodos(userId: UserId): Promise<void> {
    return (await this.repository.deleteMany({user_id: userId}));
  }
}
