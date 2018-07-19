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
   * @description updates a Todo in storage
   */
}

export default new TodoService();
