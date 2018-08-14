import { Router } from 'express';
import AuthController from './controllers/auth.ctrl';
import UserController from './controllers/user.ctrl';
import TodoController from './controllers/todo.ctrl';
import SocialAuthController from './auth/config.auth';

const AuthRouter = Router();
AuthRouter.post('/login', AuthController.login);
AuthRouter.post('/register', AuthController.register);
AuthRouter.get('/activate/:activationToken', AuthController.activate);
AuthRouter.get('/linkedin', SocialAuthController.authenticate('linkedin', {session: false}), AuthController.activate);
AuthRouter.get('/linkedin/callback', SocialAuthController.authenticate('linkedin'), AuthController.activate);
AuthRouter.get('/github', SocialAuthController.authenticate('github', {session: false}));
AuthRouter.get('/github/callback', SocialAuthController.authenticate('github'), AuthController.activate);
AuthRouter.get('/twitter', SocialAuthController.authenticate('twitter', {scope: 'email', session: false}));
AuthRouter.get('/twitter/callback', SocialAuthController.authenticate('twitter'), AuthController.activate);
AuthRouter.get('/google', SocialAuthController.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'], session: false }));
AuthRouter.get('/google/callback', SocialAuthController.authenticate('google'), AuthController.activate);

const UserRouter = Router();
UserRouter.get('/', UserController.getAll);
UserRouter.get('/:userId', UserController.getUser);

const TodoRouter = Router();
TodoRouter.post('/insert', TodoController.insertTodo);
TodoRouter.post('/insertmany', TodoController.insertMany);
TodoRouter.get('/query', TodoController.getTodos);
TodoRouter.put('/edit', TodoController.editTodo);
TodoRouter.delete('/remove', TodoController.deleteTodo);
TodoRouter.put('/thumbs', TodoController.thumbs);
TodoRouter.post('/comment', TodoController.comment);

const SwaggerAPIRouter = Router();

export {AuthRouter, UserRouter, TodoRouter, SwaggerAPIRouter};