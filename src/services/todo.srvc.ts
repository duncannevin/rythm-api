import { Todo } from '../models/todo';
import TodoRepository, { TodoType } from '../schemas/todo.schema';

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
    return (await new TodoRepository(todo).save()).toObject({virtuals: true});
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
  async searchRepository(searchString: string, query: object): Promise<Todo[]> {
   return await TodoRepository
     .find({$and: [{$text: {$search: searchString}}, query]}, {score: {$meta: 'textScore'}})
     .sort({score: {$meta: 'textScore'}}) as Todo[];
  }

  /**
   * @description queries Todos
   * @param {object} query
   * @return {Promise<Todo[]>}
   */
  async queryRepository(query: object): Promise<Todo[]> {
    return await TodoRepository.find(query) as Todo[];
  }

  /**
   * @description inserts multiple Todos
   * @param {Todo[]} todos
   * @return {Promise<void>}
   */
  async insertMany(todos: Todo[]): Promise<Todo[]> {
    return await TodoRepository.insertMany(todos) as Todo[];
  }

  /**
   * @description updates a Todo in storage
   */
  async updateOne(todo: Todo): Promise<Todo> {
    return (await TodoRepository.findOneAndUpdate({todo_id: todo.todo_id}, todo));
  }

  /**
   * @description deletes a single Todo from storage
   */
  async deleteOne(todoId: String): Promise<void> {
    return (await TodoRepository.deleteOne({todo_id: todoId}));
  }

  async deleteMany(todoIds: String[]): Promise<void> {
    return (await TodoRepository.deleteMany({todo_id: {$in: todoIds}}));
  }

  /**
   * @description deletes all of a users Todos
   */
  async deleteUsersTodos(username: String): Promise<void> {
    return (await TodoRepository.deleteMany({username: username}));
  }
}

export default new TodoService();
