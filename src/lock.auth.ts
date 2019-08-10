import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export class Lock {
  constructor () {
    this.required = this.required.bind(this);
    this.optional = this.optional.bind(this);
  }

  required (req: Request, res: Response, next: NextFunction): void {
    try {
      const token = req.session.jwt;
      if (!token) throw new Error('no authorization token found');
      const secret = process.env.SESSION_SECRET;
      const decoded = verify(token, secret);
      req['user'] = decoded;
      next();
    } catch (error) {
      res.status(401).send({ msg: 'unauthorized', code: 401 });
    }
  }

  optional (req: Request, res: Response, next: NextFunction): void {
    try {
      const token = req.session.jwt;
      const secret = process.env.SESSION_SECRET;
      const decoded = verify(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      next();
    }
  }
}