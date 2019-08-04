import { Request } from 'express';
import { Dictionary, MappedError } from 'express-validator/shared-typings';
import { jwtPayload } from './helpers.utl';
import { TodoService } from '../services/todo.srvc';
import { injectable, inject } from 'tsyringe';
import { ValidatorsType } from 'validators.type';

@injectable()
export class Validators implements ValidatorsType {
  constructor (
    @inject('TodoServiceType') private todoService: TodoService
  ) {}

  validateInsertTodo (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('user_id', 'user_id is empty').notEmpty();
    req.checkBody('username', 'username is empty').notEmpty();
    req.checkBody('private', 'private is empty').notEmpty();
    req.checkBody('title', 'title is empty').notEmpty();
    req.checkBody('description', 'description is empty').notEmpty();
    req.checkBody('category', 'category is empty').notEmpty();
    req.checkBody('list', 'list is empty').notEmpty();

    return req.validationErrors();
  }

  validateLogin (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    return req.validationErrors();
  }

  validateRegister (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('fname', 'First name must be specified').notEmpty();
    req.checkBody('lname', 'Last name must be specified').notEmpty();
    req.checkBody('username', 'Username must be specified').notEmpty();
    req.checkBody('role', 'Role must be specified').notEmpty();

    req.assert('email', 'Email is not valid').isEmail();
    req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

    return req.validationErrors();
  }

  validateInsertTodos (req: Request): Dictionary<MappedError> | MappedError[] {
    req.assert('todos', 'Todos must exist and be an array').notEmpty();

    return req.validationErrors();
  }

  validateTodoQuery (req: Request): boolean | string {
    const okParams = ['todo_id', 'user_id', 'search', 'username', 'category'];
    const queryFields = Object.keys(req.query);

    if (queryFields.length) {
      return queryFields.reduce((bool, field) => {
        if (!okParams.includes(field)) bool = true;
        return bool;
      }, false) ? `'${okParams.join(',')}' are the only valid query parameters` : false;
    } else {
      return 'No query present with request';
    }
  }

  validateDelete (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('todo_id').exists();
    return req.validationErrors();
  }

  validateEditTodo (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('todo_id', 'Body must contain todo_id field').exists();
    return req.validationErrors();
  }

  validateIncrementThumbs (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('thumb').exists();
    req.checkBody('thumb').isIn(['thumbUp', 'thumbDown']);
    req.checkBody('todo_id', 'Body must contain todo_id').exists();
    return req.validationErrors();
  }

  async validateSameUser (req: Request): Promise<any> {
    const todo = await this.todoService.findOne(req.body.todo_id);
    if (todo && todo.user_id !== jwtPayload(req).user_id) {
      return {msg: 'Client needs to own this todo for this operation', code: 401};
    } else if (!todo) {
      return {msg: 'TodoMdl not found in system', code: 404};
    } else {
      return;
    }
  }

  async validateDifferentUser (req: Request): Promise<any> {
    const todo = await this.todoService.findOne(req.body.todo_id);
    if (todo && todo.user_id === jwtPayload(req).user_id) {
      return {msg: 'Client cannot own this todo for this operation', code: 401};
    } else if (!todo) {
      return {msg: 'TodoMdl not found in system', code: 404};
    } else {
      return false;
    }
  }

  validateComment (req: Request): Dictionary<MappedError> | MappedError[] {
    req.checkBody('todo_id', 'todo_id must be present').exists();
    req.checkBody('text', 'Must include a comment').exists();
    return req.validationErrors();
  }
}
