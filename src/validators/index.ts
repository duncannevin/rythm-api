import { Request } from 'express';

export let validateTodo = (req: Request) => {
  req.validate('user_id', 'user_id is empty').notEmpty();
  req.validate('username', 'username is empty').notEmpty();
  req.validate('private', 'private is empty').notEmpty();
  req.validate('title', 'title is empty').notEmpty();
  req.validate('description', 'description is empty').notEmpty();
  req.validate('category', 'category is empty').notEmpty();
  req.validate('list', 'list is empty').notEmpty();

  return req.validationErrors();
};

export let validateLogin = (req: Request) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

  return req.validationErrors();
};

export let validateRegister = (req: Request) => {
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('fname', 'First name must be specified').notEmpty();
  req.assert('lname', 'Last name must be specified').notEmpty();
  req.assert('username', 'Username must be specified').notEmpty();
  req.assert('role', 'Role must be specified').notEmpty();

  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

  return req.validationErrors();
};