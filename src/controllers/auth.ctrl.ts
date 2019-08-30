import { Request, Response, NextFunction } from 'express';
import { inject, autoInjectable, singleton } from 'tsyringe';
import { UserMdl } from '../models/user.mdl';
import { UserService } from '../services/user.srvc';
import { Validators } from '../utils/validators.utl';
import { authLogger } from '../utils/loggers.utl';
import { Email, Username } from 'general-types';
import { AuthControllerType } from 'auth-ctrl.type';

@singleton()
@autoInjectable()
export class AuthController implements AuthControllerType {
  constructor (
    @inject('UserServiceType') private userService?: UserService,
    @inject('ValidatorsType') private validators?: Validators,
  ) {
    this.emailExistsCheck = this.emailExistsCheck.bind(this);
    this.usernameExistsCheck = this.usernameExistsCheck.bind(this);
    this.register = this.register.bind(this);
    this.activate = this.activate.bind(this);
  }

  async emailExistsCheck(req: Request, resp: Response): Promise<any> {
    try {
      const possibleEmail: Email = req.params.email;
      const maybeUser: UserMdl = await this.userService.findByEmail(possibleEmail);
      resp.status(200).send({
        exists: !!maybeUser
      });
    } catch (error) {
      authLogger.debug('email exists check error', error);
      resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async usernameExistsCheck(req: Request, resp: Response): Promise<any> {
    try {
      const possibleUsername: Username = req.params.username;
      const maybeUser: UserMdl = await this.userService.findByUsername(possibleUsername);
      resp.status(200).send({
        exists: !!maybeUser
      });
    } catch (error) {
      authLogger.debug('email exists check error', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    const validationErrors = this.validators.validateRegister(req);

    if (validationErrors) {
      authLogger.debug('register validation errors', validationErrors);
      return res.status(401).send({
        msg: validationErrors,
        status: 401
      });
    }
    const user: UserMdl = req.body;
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByUsernameOrEmail(user.username, user.email);
      if (existingUser) {
        authLogger.debug('register user already exists', existingUser.user_id);
        return res.status(409).send({
          msg: 'UserMdl already exists',
          status: 409
        });
      }
      req.user = await this.userService.save(user);
      authLogger.info('register successful');
      next();
    } catch (error) {
      authLogger.debug('register failed', error);
      res.status(400).send({
        msg: 'Failed to register',
        status: 400
      });
    }
  }

  async activate(req: Request, res: Response): Promise<any> {
    try {
      const user = req.user;
      authLogger.info('activate successful');
      const authToken = user.toAuthJSON()
      req.session.jwt = await authToken.token;
      delete authToken.token;
      return res.status(200).send(authToken);
    } catch (error) {
      authLogger.debug('activate failed', error);
      res.status(400).send({
        msg: 'Activation token expired, please register again',
        status: 400
      });
    }
  }

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) return res.status(400).send('failed to logout');
      res.status(200).send({ msg: 'logged out' });
    });
  }
}
