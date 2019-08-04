import { container } from 'tsyringe';

import { TodoService } from './services/todo.srvc';
import { UserService } from './services/user.srvc';

import { TodoController } from './controllers/todo.ctrl';
import { UserController } from './controllers/user.ctrl';
import { AuthController } from './controllers/auth.ctrl'; 
import { RRouter } from './routes';
import { Validators } from './utils/validators.utl';
import { SocialAuthController } from './controllers/social-auth.ctrl';

container
  .register('TodoServiceType', {
    useClass: TodoService
  })
container
  .register('UserServiceType', {
    useClass: UserService
  })
container
  .register('ValidatorsType', {
    useClass: Validators
  })

const todoCtrl = container.resolve(TodoController);
const userCtrl = container.resolve(UserController);
const authCtrl = container.resolve(AuthController);
const socialAuthCtrl = container.resolve(SocialAuthController);
const rrouter = container.resolve(RRouter);
