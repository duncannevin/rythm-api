import { Request, Response } from 'express';
import { inject, autoInjectable, singleton } from 'tsyringe';

import { UserService } from '../services/user.srvc';
import { userLogger } from '../utils/loggers.utl';

@singleton()
@autoInjectable()
export class UserController {
  constructor (
    @inject('UserServiceType') private userService?: UserService
  ) {}

  async getAll(req: Request, resp: Response) {
    try {
      const users = await this.userService.findAll();
      userLogger.info('getAll successful');
      resp.status(200).send(users);
    } catch (error) {
      userLogger.debug('getAll failed', error);
      resp.status(404).send({
        msg: 'Not found',
        status: 404
      });
    }
  }

  async getUser(req: Request, resp: Response) {
    try {
      const user = await this.userService.findByUserId(req.params.userId);
      userLogger.info('getUser successful');
      resp.status(200).send(user);
    } catch (error) {
      userLogger.debug('getUser failed', error);
      resp.status(404).send({
        msg: 'Not found',
        status: 404
      });
    }
  }
}
