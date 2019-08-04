import { Request, Response } from 'express';
import { inject, autoInjectable, singleton } from 'tsyringe';

import { TodoService } from '../services/todo.srvc';
import { UserService } from '../services/user.srvc';
import { Validators } from '../utils/validators.utl';
import * as omit from 'object.omit';
import { TodoId, UserId } from '../types/general-types';
import { jwtPayload } from '../utils/helpers.utl';
import { todoLogger } from '../utils/loggers.utl';
import { TodoControllerType } from 'todo-ctrl.type';

@singleton()
@autoInjectable()
export class TodoController implements TodoControllerType {
  constructor (
    @inject('TodoServiceType') private todoService?: TodoService,
    @inject('UserServiceType') private userService?: UserService,
    @inject('ValidatorsType') private validators?: Validators
  ) {}

  async insertTodo (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateInsertTodo(req);

    if (validationErrors) {
      todoLogger.debug('insertTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todo = await this.todoService.save(req.body);

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

  async getTodos (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateTodoQuery(req);

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
        todos = await this.todoService.searchRepository(query.search, omit(query, 'search'));
      } else {
        todos = await this.todoService.queryRepository(query);
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

  async insertMany (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateInsertTodos(req);

    if (validationErrors) {
      todoLogger.debug('insertMany validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todos = await this.todoService.insertMany(req.body.todos);
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

  async editTodo (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateEditTodo(req);

    if (validationErrors) {
      todoLogger.debug('editTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const sameUserError = await this.validators.validateSameUser(req);
      if (sameUserError) {
        todoLogger.debug('editTodo same user error', sameUserError);
        return resp.status(sameUserError.code).send(sameUserError);
      }

      const todo = await this.todoService.updateOne(req.body);
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

  async thumbs (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateIncrementThumbs(req);

    if (validationErrors) {
      todoLogger.debug('thumbs validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const differentUserError = await this.validators.validateDifferentUser(req);
      if (differentUserError) {
        todoLogger.debug('thumbs different user error', differentUserError);
        return resp.status(differentUserError.code).send(differentUserError);
      }

      const todoId: TodoId = req.body.todo_id;
      const raterId: UserId = jwtPayload(req).user_id;
      const thumb = req.body.thumb;

      const rater = await this.userService.findByUserId(raterId);
      let todo;
      if (rater.liked.includes(todoId) && thumb === 'thumbUp') {
        await this.userService.removeLiked(raterId, todoId);
        todo = await this.todoService.decrementThumbUp(todoId);
      } else if (rater.notLiked.includes(todoId) && thumb === 'thumbDown') {
        await this.userService.removeNotLiked(raterId, todoId);
        todo = await this.todoService.decrementThumbDown(todoId);
      } else if (rater.liked.includes(todoId) && thumb === 'thumbDown') {
        await this.userService.removeLiked(raterId, todoId);
        await this.userService.addNotLiked(raterId, todoId);
        await this.todoService.decrementThumbUp(todoId);
        todo = await this.todoService.thumbDown(todoId);
      } else if (rater.notLiked.includes(todoId) && thumb === 'thumbUp') {
        await this.userService.removeNotLiked(raterId, todoId);
        await this.userService.addLiked(raterId, todoId);
        await this.todoService.decrementThumbDown(todoId);
        todo = await this.todoService.thumbUp(todoId);
      } else {
        if (thumb === 'thumbUp') {
          await this.userService.addLiked(raterId, todoId);
        } else {
          await this.userService.addNotLiked(raterId, todoId);
        }
        todo = await this.todoService[thumb](todoId);
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

  async comment (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateComment(req);

    if (validationErrors) {
      todoLogger.debug('comment validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const todo = await this.todoService.insertComment(req.body.todo_id, omit(req.body, 'todo_id'));
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

  async deleteTodo (req: Request, resp: Response): Promise<any> {
    const validationErrors = this.validators.validateDelete(req);

    if (validationErrors) {
      todoLogger.debug('deleteTodo validation error', validationErrors);
      return resp.status(422).send({
        msg: validationErrors,
        code: 422
      });
    }

    try {
      const sameUserError = await this.validators.validateSameUser(req);
      if (sameUserError) {
        todoLogger.debug('deleteTodo same user error', sameUserError);
        return resp.status(sameUserError.code).send(sameUserError);
      }

      await this.todoService.deleteOne(req.body.todo_id);
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
