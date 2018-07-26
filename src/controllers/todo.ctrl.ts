import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import {
  validateDelete, validateEditTodo,
  validateInsertTodo,
  validateInsertTodos,
  validateLogin,
  validateTodoQuery
} from '../utils/validators';
import * as omit from 'object.omit';
import { Todo } from '../models/todo';

class TodoController {
  async insertTodo (req: Request, resp: Response) {
    const validationErrors = validateInsertTodo(req);

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
    const validationErrors = validateTodoQuery(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

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
    const validationErrors = validateInsertTodos(req);

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
    const validationErrors = validateEditTodo(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const body = req.body;
      const todo = await TodoService.updateOne(body);
      console.log(todo);
      return resp.status(200).send(todo);
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async deleteTodo (req: Request, resp: Response) {
    const validationErrors = validateDelete(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todoId = req.body.todo_id;
      const todo = await TodoService.findOne(todoId);
      if (!todo) {
        return resp.status(404).send({
          msg: `${todoId} not in the system`,
          code: 404
        });
      }
      const removed = await TodoService.deleteOne(todoId);
      return resp.status(204).send(`${removed} Removed successfully`);
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }
}

export default new TodoController();