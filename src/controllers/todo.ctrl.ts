import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import { validateTodo } from '../validators';
import { Todo } from '../models/todo';
import * as omit from 'object.omit';
import { street1 } from 'aws-sdk/clients/importexport';

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

  async _filterTodos (todos: Todo[], query: string) {
    if (query) {
      return await todos.filter((todo) => (todo.title + todo.description).includes(query));
    } else {
      return await todos;
    }
  }

  async getTodos (req: Request, resp: Response) {
    try {
      const query = req.query;
      const todos = await TodoService.queryRepository(omit(JSON.parse(JSON.stringify(query)), 'search'));
      return resp.status(200).send(todos);
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