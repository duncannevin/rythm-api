import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';

class TodoController {
  async insertTodo (req: Request, resp: Response) {
    const todo = req.body;
    resp.send(`insert ${JSON.stringify(todo)}`);
  }

  async getTodos (req: Request, resp: Response) {
    const query = req.query;
    resp.send(`get ${JSON.stringify(query)}`);
  }

  async editTodo (req: Request, resp: Response) {
    const todo = req.body;
    resp.send(`edit ${JSON.stringify(todo)}`);
  }

  async deleteTodo (req: Request, resp: Response) {
    const tokenId = req.params.todoId;
    resp.send(`delete ${tokenId}`);
  }
}

export default new TodoController();