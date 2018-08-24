import { Request, Response } from 'express';
import { default as TodoService } from '../services/todo.srvc';
import { default as UserService } from '../services/user.srvc';
import {
  validateComment,
  validateDelete, validateDifferentUser, validateEditTodo, validateIncrementThumbs,
  validateInsertTodo,
  validateInsertTodos,
  validateSameUser,
  validateTodoQuery
} from '../utils/validators.utl';
import * as omit from 'object.omit';
import { TodoId, UserId } from '../types/general-types';
import { jwtPayload } from '../utils/helpers.utl';
import { todoLogger } from '../utils/loggers.utl';

class TodoController {
  async insertTodo (req: Request, resp: Response) {
    const validationErrors = validateInsertTodo(req);

    if (validationErrors) {
      todoLogger.debug('insertTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todo = await TodoService.save(req.body);

      if (!todo) {
        todoLogger.debug('insertTodo failed to insert todo');
        return resp.status(404).send({
          msg: 'Failed to insert user',
          code: 404
        });
      }
      todoLogger.info('insertTodo success');
      return resp.status(201).send(todo);
    } catch (error) {
      todoLogger.debug('insertTodo failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async getTodos (req: Request, resp: Response) {
    const validationErrors = validateTodoQuery(req);

    if (validationErrors) {
      todoLogger.debug('getTodos validation error', validationErrors);
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
      todoLogger.info('getTodos success');
      return resp.status(200).send(todos);
    } catch (error) {
      todoLogger.debug('getTodos failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async insertMany (req: Request, resp: Response) {
    const validationErrors = validateInsertTodos(req);

    if (validationErrors) {
      todoLogger.debug('insertMany validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todos = await TodoService.insertMany(req.body.todos);
      todoLogger.info('insertMany success');
      return resp.status(201).send(todos);
    } catch (error) {
      todoLogger.debug('insertMany failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async editTodo (req: Request, resp: Response) {
    const validationErrors = validateEditTodo(req);

    if (validationErrors) {
      todoLogger.debug('editTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const sameUserError = await validateSameUser(req);
      if (sameUserError) {
        todoLogger.debug('editTodo same user error', sameUserError);
        return resp.status(sameUserError.code).send(sameUserError);
      }

      const todo = await TodoService.updateOne(req.body);
      todoLogger.info('editTodd successful');
      return resp.status(200).send(todo);
    } catch (error) {
      todoLogger.debug('editTodo failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async thumbs (req: Request, resp: Response) {
    const validationErrors = validateIncrementThumbs(req);

    if (validationErrors) {
      todoLogger.debug('thumbs validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const differentUserError = await validateDifferentUser(req);
      if (differentUserError) {
        todoLogger.debug('thumbs different user error', differentUserError);
        return resp.status(differentUserError.code).send(differentUserError);
      }

      const todoId: TodoId = req.body.todo_id;
      const raterId: UserId = jwtPayload(req).user_id;
      const thumb = req.body.thumb;

      const rater = await UserService.findByUserId(raterId);
      let todo;
      if (rater.liked.includes(todoId) && thumb === 'thumbUp') {
        await UserService.removeLiked(raterId, todoId);
        todo = await TodoService.decrementThumbUp(todoId);
      } else if (rater.notLiked.includes(todoId) && thumb === 'thumbDown') {
        await UserService.removeNotLiked(raterId, todoId);
        todo = await TodoService.decrementThumbDown(todoId);
      } else if (rater.liked.includes(todoId) && thumb === 'thumbDown') {
        await UserService.removeLiked(raterId, todoId);
        await UserService.addNotLiked(raterId, todoId);
        await TodoService.decrementThumbUp(todoId);
        todo = await TodoService.thumbDown(todoId);
      } else if (rater.notLiked.includes(todoId) && thumb === 'thumbUp') {
        await UserService.removeNotLiked(raterId, todoId);
        await UserService.addLiked(raterId, todoId);
        await TodoService.decrementThumbDown(todoId);
        todo = await TodoService.thumbUp(todoId);
      } else {
        if (thumb === 'thumbUp') {
          await UserService.addLiked(raterId, todoId);
        } else {
          await UserService.addNotLiked(raterId, todoId);
        }
        todo = await TodoService[thumb](todoId);
      }
      todoLogger.info('thumbs successful');
      return resp.status(200).send(todo);
    } catch (error) {
      todoLogger.debug('thumbs failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async comment (req: Request, resp: Response) {
    const validationErrors = validateComment(req);

    if (validationErrors) {
      todoLogger.debug('comment validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todo = await TodoService.insertComment(req.body.todo_id, omit(req.body, 'todo_id'));
      todoLogger.info('comment successful');
      return resp.status(200).send(todo);
    } catch (error) {
      todoLogger.debug('comment failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async deleteTodo (req: Request, resp: Response) {
    const validationErrors = validateDelete(req);

    if (validationErrors) {
      todoLogger.debug('deleteTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const sameUserError = await validateSameUser(req);
      if (sameUserError) {
        todoLogger.debug('deleteTodo same user error', sameUserError);
        return resp.status(sameUserError.code).send(sameUserError);
      }

      await TodoService.deleteOne(req.body.todo_id);
      todoLogger.info('deleteTodo successful');
      return resp.status(204).send();
    } catch (error) {
      todoLogger.debug('deleteTodo failed');
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }
}

export default new TodoController();