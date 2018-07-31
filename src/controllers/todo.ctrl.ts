import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import {
  validateDelete, validateDifferentUser, validateEditTodo, validateIncrementThumbs,
  validateInsertTodo,
  validateInsertTodos,
  validateSameUser,
  validateTodoQuery
} from '../utils/validators';
import * as omit from 'object.omit';
import { jwtPayload } from '../utils/helpers';

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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
      const sameUserError = await validateSameUser(req);
      if (sameUserError) {
        return resp.status(sameUserError.code).send(sameUserError);
      }

      const todo = await TodoService.updateOne(req.body);
      return resp.status(200).send(todo);
    } catch (error) {
      console.log(error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async incrementThumbs (req: Request, resp: Response) {
    const validationErrors = validateIncrementThumbs(req);

    if (validationErrors) {
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const differentUserError = await validateDifferentUser(req);
      if (differentUserError) {
        return resp.status(differentUserError.code).send(differentUserError);
      }
      const todo = await TodoService.incrementThumbs(req.body.todo_id, Math.sign(req.body.direction));
      return resp.status(200).send(todo);
    } catch (error) {
      console.error(error);
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
      const sameUserError = await validateSameUser(req);
      if (sameUserError) {
        return resp.status(sameUserError.code).send(sameUserError);
      }

      await TodoService.deleteOne(req.body.todo_id);
      return resp.status(204).send();
    } catch (error) {
      console.log(error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }
}

export default new TodoController();