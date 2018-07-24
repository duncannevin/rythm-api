import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import { validateTodo, validateTodos } from '../validators';
import * as omit from 'object.omit';

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
      const query = req.query;
      let todos;
      if (query.hasOwnProperty('search')) {
        todos = await TodoService.searchRepository(query.search, omit(query, 'search'));
      } else {
        todos = await TodoService.queryRepository(query);
      }
      return resp.status(200).send(todos);
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async insertMany (req: Request, resp: Response) {
    const validationErrors = validateTodos(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todos = await TodoService.insertMany(req.body.todos);
      return resp.status(201).send(todos);
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