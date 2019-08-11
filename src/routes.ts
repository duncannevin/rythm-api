import { autoInjectable, inject } from 'tsyringe';
import { verify } from 'jsonwebtoken';
import { Router, Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

import { AuthController } from './controllers/auth.ctrl';
import { UserController } from './controllers/user.ctrl';
import { TodoController } from './controllers/todo.ctrl';
import { PassportControl } from './controllers/passport.ctrl';
import { Lock } from './lock.auth';

@autoInjectable()
export class RRouter {
  authRouter: Router = Router();
  userRouter: Router = Router();
  todoRouter: Router = Router();
  swaggerRouter: Router = Router();

  constructor (
    private passportController?: PassportControl,
    private authController?: AuthController,
    private userController?: UserController,
    private todoController?: TodoController,
    private lock?: Lock
  ) {
    this._initialize();
  }

  _initialize (): void {
    this.authRouter.get('/test', this.lock.required, (req, res) => {
      res.send({ usr: req.user, yo: 'dude' });
    });
    this.authRouter.get('/test2', this.lock.optional, (req, res) => {
      res.send({ usr: req.user });
    });

    this.authRouter.post('/register', this.authController.register, this.authController.activate);
    this.authRouter.post('/login', passport.authenticate('local', { session: false }), this.authController.activate);
    this.authRouter.get('/activate/:activationToken', this.authController.activate);
    this.authRouter.get('/exists/username/:username', this.authController.usernameExistsCheck);
    this.authRouter.get('/exists/email/:email', this.authController.emailExistsCheck);
    this.authRouter.get('/linkedin', this.passportController.authenticate('linkedin', {session: false}), this.authController.activate);
    this.authRouter.get('/linkedin/callback', this.passportController.authenticate('linkedin'), this.authController.activate);
    this.authRouter.get('/github', this.passportController.authenticate('github', {session: false}));
    this.authRouter.get('/github/callback', this.passportController.authenticate('github'), this.authController.activate);
    this.authRouter.get('/twitter', this.passportController.authenticate('twitter', {scope: 'email', session: false}));
    this.authRouter.get('/twitter/callback', this.passportController.authenticate('twitter'), this.authController.activate);
    this.authRouter.get('/google', this.passportController.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'], session: false }));
    this.authRouter.get('/google/callback', this.passportController.authenticate('google'), this.authController.activate);
    this.authRouter.put('/logout', this.authController.logout)

    this.userRouter.get('/', this.userController.getAll);
    this.todoRouter.get('/:userId', this.userController.getUser);

    this.todoRouter.post('/insert', this.todoController.insertTodo);
    this.todoRouter.post('/insertmany', this.todoController.insertMany);
    this.todoRouter.get('/query', this.todoController.getTodos);
    this.todoRouter.put('/edit', this.todoController.editTodo);
    this.todoRouter.delete('/remove', this.todoController.deleteTodo);
    this.todoRouter.put('/thumbs', this.todoController.thumbs);
    this.todoRouter.post('/comment', this.todoController.comment);

    this.swaggerRouter = Router();
  }
}
