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
  async updateOne(todo: Todo): Promise<Todo> {
    return (await TodoRepository.findOneAndUpdate({todo_id: todo.todo_id}, todo));
  }

  /**
   * @description deletes a single Todo from storage
   */
  async deleteOne(todoId: String): Promise<void> {
    return (await TodoRepository.deleteOne({todo_id: todoId}));
  }

  /**
   * @description deletes all of a users Todos
   */
  async deleteUsersTodos(username: String): Promise<void> {
    return (await TodoRepository.deleteMany({username: username}));
  }
}

export default new TodoService();
