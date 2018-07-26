import { Request } from 'express';
import { check } from 'express-validator/check';
import has = Reflect.has;

export const validateInsertTodo = (req: Request) => {
  req.checkBody('user_id', 'user_id is empty').notEmpty();
  req.checkBody('username', 'username is empty').notEmpty();
  req.checkBody('private', 'private is empty').notEmpty();
  req.checkBody('title', 'title is empty').notEmpty();
  req.checkBody('description', 'description is empty').notEmpty();
  req.checkBody('category', 'category is empty').notEmpty();
  req.checkBody('list', 'list is empty').notEmpty();

  return req.validationErrors();
};

export const validateLogin = (req: Request) => {
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

  return req.validationErrors();
};

export const validateRegister = (req: Request) => {
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('fname', 'First name must be specified').notEmpty();
  req.checkBody('lname', 'Last name must be specified').notEmpty();
  req.checkBody('username', 'Username must be specified').notEmpty();
  req.checkBody('role', 'Role must be specified').notEmpty();

  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

  return req.validationErrors();
};

export const validateInsertTodos = (req: Request) => {
  req.assert('todos', 'Todos must exist and be an array').notEmpty();

  return req.validationErrors();
};

export const validateTodoQuery = (req: Request): boolean | string => {
  const okParams = ['todo_id', 'user_id', 'search', 'username', 'category'];
  const queryFields = Object.keys(req.query);

  if (queryFields.length) {
    return queryFields.reduce((bool, field) => {
      if (!okParams.includes(field)) bool = true;
      return bool;
    }, false) ? `'${okParams.join(',')}' are the only valid query parameters` : false;
  } else {
    return false;
  }
};

export const validateDelete = (req: Request) => {
  req.checkBody('todo_id').exists();
  return req.validationErrors();
};

export const validateEditTodo = (req: Request) => {
  req.checkBody('todo_id', 'Body must contain todo_id field').exists();
  return req.validationErrors();
};