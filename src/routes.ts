import { Router } from 'express';
import AuthController from './controllers/auth.ctrl';
import UserController from './controllers/user.ctrl';
import TodoController from './controllers/todo.ctrl';

const AuthRouter = Router();
AuthRouter.post('/login', AuthController.login);
AuthRouter.post('/register', AuthController.register);
AuthRouter.get('/activate/:activationToken', AuthController.activate);

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