import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import { validateTodo } from '../validators';

class TodoController {
  async insertTodo (req: Request, resp: Response) {
    const validationErrors = validateTodo(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todo = await TodoService.save(req.body);

      if (!todo) {
        return resp.status(404).send({
          msg: 'Failed to insert user',
          code: 404
        });
      }

      return resp.status(201).send(todo);
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async getTodos (req: Request, resp: Response) {
    try {
      switch (req.query) {
        case 'category':
          break;
        case 'id':
          break;
        case 'search':
          break;
        case 'user_id':
          break;
        case 'username':
          break;
        default: // todo only allow if role is admin
          const todos = await TodoService.fetchAll();
          return resp.status(200).send(todos);
      }
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
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