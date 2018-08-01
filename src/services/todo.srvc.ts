import { Todo } from '../models/todo';
import TodoRepository, { TodoType } from '../schemas/todo.schema';
import { TodoId, UserId, Username } from 'general-types.ts';
import { Query } from '../models/query';
import * as omit from 'object.omit';

/**
 * @class TodoServer
 */
class TodoService {
  /**
   * @description saves Todo to storage
   * @param {Todo} todo
   * @return {Promise<Todo>}
   */
  async save(todo: Todo): Promise<Todo> {
    return await new TodoRepository(todo).save();
  }

  /**
   * @description fetches all Todos from storage
   * @return {Promise<Todo[]>}
   */
  async fetchAll(): Promise<Todo[]> {
    return await TodoRepository.find() as Todo[];
  }

  /**
   * @description gets Todos based on a full text search
   * @param {string} searchString
   * @param {object} query
   * @return {Promise<Todo[]>}
   */
  async searchRepository(searchString: string, query: Query): Promise<Todo[]> {
   return await TodoRepository
     .find({$and: [{$text: {$search: searchString}}, query]}, {score: {$meta: 'textScore'}})
     .sort({score: {$meta: 'textScore'}}) as Todo[];
  }

  /**
   * @description queries Todos
   * @param {object} query
   * @return {Promise<Todo[]>}
   */
  async queryRepository(query: Query): Promise<Todo[]> {
    return await TodoRepository.find(query) as Todo[];
  }

  /**
   * @description finds a single Todo by id
   * @param {TodoId} todoId
   * @return {Promise<Todo>}
   */
  async findOne(todoId: TodoId): Promise<Todo> {
    return await TodoRepository.findOne({todo_id: todoId}, {'ratings.raters': 0});
  }

  /**
   * @description increment thumbs_up
   * @param {TodoId} todoId
   * @return {Promise<Todo>}
   */
  async thumbUp(todoId: TodoId): Promise<Todo> {
    return (await TodoRepository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_up: 1}}, {new: true}));
  }

  /**
   * @description increment thumbs_down
   * @param {TodoId} todoId
   * @return {Promise<Todo>}
   */
  async thumbDown(todoId: TodoId): Promise<Todo> {
    return (await TodoRepository.findOneAndUpdate({todo_id: todoId}, {$inc: {thumbs_down: 1}}, {new: true}));
  }

  /**
   * @description inserts multiple Todos
   * @param {Todo[]} todos
   * @return {Promise<void>}
   */
  async insertMany(todos: Todo[]): Promise<Todo[]> {
    return await TodoRepository.create(todos) as Todo[];
  }

  /**
   * @description updates a Todo in storage
   */
  async updateOne(todo: Todo): Promise<Todo> {
    return (await TodoRepository.findOneAndUpdate({todo_id: todo.todo_id}, {$set: todo}, {new: true}));
  }

  /**
   * @description deletes a single Todo from storage
   */
  async deleteOne(todoId: TodoId): Promise<void> {
    return await TodoRepository.deleteOne({todo_id: todoId});
  }

  async deleteMany(todoIds: TodoId[]): Promise<void> {
    return (await TodoRepository.deleteMany({todo_id: {$in: todoIds}}));
  }

  /**
   * @description deletes all of a users Todos
   */
  async deleteUsersTodos(username: Username): Promise<void> {
    return (await TodoRepository.deleteMany({username: username}));
  }
}

export default new TodoService();
