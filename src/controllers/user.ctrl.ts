import { Request, Response } from 'express';
import { default as UserService } from '../services/user.srvc';

class UserController {

  async getAll(req: Request, resp: Response) {
    try {
      const users = await UserService.findAll();
      resp.status(200).send(users);
    } catch (error) {
      resp.status(404).send({
        msg: 'Not found',
        status: 404
      });
    }
  }

  async getUser(req: Request, resp: Response) {
    try {
      const user = await UserService.findByUserId(req.params.userId);
      resp.status(200).send(user);
    } catch (error) {
      resp.status(404).send({
        msg: 'Not found',
        status: 404
      });
    }
  }
}

export default new UserController();