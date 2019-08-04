import { Router } from 'express';
import { autoInjectable, inject } from 'tsyringe';

import { AuthController } from './controllers/auth.ctrl';
import { UserController } from './controllers/user.ctrl';
import { TodoController } from './controllers/todo.ctrl';
import { SocialAuthController } from './controllers/social-auth.ctrl';
import { PassportStatic } from 'passport';

@autoInjectable()
export class RRouter {
  authRouter: Router = Router();
  userRouter: Router = Router();
  todoRouter: Router = Router();
  swaggerRouter: Router = Router();

  constructor (
    private socialAuthController?: SocialAuthController,
    private authController?: AuthController,
    private userController?: UserController,
    private todoController?: TodoController
  ) {
    this._initialize();
  }

  _initialize (): void {
    this.authRouter.post('/login', this.authController.login);
    this.authRouter.post('/register', this.authController.register);
    this.authRouter.get('/activate/:activationToken', this.authController.activate);
    this.authRouter.get('/exists/username/:username', this.authController.usernameExistsCheck);
    this.authRouter.get('/exists/email/:email', this.authController.emailExistsCheck);
    this.authRouter.get('/linkedin', this.socialAuthController.authenticate('linkedin', {session: false}), this.authController.activate);
    this.authRouter.get('/linkedin/callback', this.socialAuthController.authenticate('linkedin'), this.authController.activate);
    this.authRouter.get('/github', this.socialAuthController.authenticate('github', {session: false}));
    this.authRouter.get('/github/callback', this.socialAuthController.authenticate('github'), this.authController.activate);
    this.authRouter.get('/twitter', this.socialAuthController.authenticate('twitter', {scope: 'email', session: false}));
    this.authRouter.get('/twitter/callback', this.socialAuthController.authenticate('twitter'), this.authController.activate);
    this.authRouter.get('/google', this.socialAuthController.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'], session: false }));
    this.authRouter.get('/google/callback', this.socialAuthController.authenticate('google'), this.authController.activate);

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
