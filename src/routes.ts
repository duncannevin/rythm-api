import { Router } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { verify } from 'jsonwebtoken';

import { AuthController } from './controllers/auth.ctrl';
import { UserController } from './controllers/user.ctrl';
import { TodoController } from './controllers/todo.ctrl';
import { PassportControl } from './controllers/passport.ctrl';
import { PassportStatic } from 'passport';
import passport = require('passport');

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
    private todoController?: TodoController
  ) {
    this._lockRequired = this._lockRequired.bind(this);
    this._lockOptional = this._lockOptional.bind(this);

    this._initialize();
  }

  private _getToken (req) {
    const { headers: { authorization } } = req;
    const name = authorization.split(' ')[0]
    if (name === 'Token' || name === 'Bearer') {
      return authorization.split(' ')[1];
    }

    return null;
  }

  private _lockRequired (req, res, next) {
    try {
      const token = this._getToken(req);
      if (!token) return res.status(401).send({ msg: 'unauthorized', code: 401 });
      const secret = process.env.SESSION_SECRET;
      const decoded = verify(token, secret);
      req.user = decoded;
      next();
    } catch(error) {
      res.status(401).send({ msg: 'unauthorized', code: 401 });
    }
  }

  private _lockOptional (req, res, next) {
    try {
      const token = this._getToken(req);
      const secret = process.env.SESSION_SECRET;
      const decoded = verify(token, secret);
      req.user = decoded;
      next();
    } catch(error) {
      next();
    }
  }

  _initialize (): void {
    this.authRouter.get('/test', this._lockRequired, (req, res) => {
      res.send({ usr: req.user });
    });
    this.authRouter.get('/test2', this._lockOptional, (req, res) => {
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
