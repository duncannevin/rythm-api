import { Request, Response } from 'express';
import { inject, autoInjectable, singleton } from 'tsyringe';

import { UserService } from '../services/user.srvc';
import { userLogger } from '../utils/loggers.utl';
import { UserMdl } from '../models/user.mdl';

@singleton()
@autoInjectable()
export class UserController {
  constructor (
    @inject('UserServiceType') private userService?: UserService
  ) {
    this.getUser = this.getUser.bind(this);
  }

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
      const { id } = req.user;
      const user = await this.userService.findById(id);
      userLogger.info('getUser successful');
      resp.status(200).send(this._filterUser(user));
    } catch (error) {
      userLogger.debug('getUser failed', error);
      req.session.destroy(() => {
        resp.status(404).send({
          msg: 'Not found',
          status: 404
        });
      });
    }
  }

  private _filterUser ({ _id, email, role, username, createdAt, updatedAt, user_id, liked, notLiked, interests }: UserMdl) {
    return { _id, email, role, username, createdAt, updatedAt, user_id, liked, notLiked, interests }
  }
}
