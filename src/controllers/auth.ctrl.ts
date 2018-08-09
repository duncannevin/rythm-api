import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { User } from '../models/user';
import { default as UserService } from '../services/user.srvc';
import { validateLogin, validateRegister } from '../utils/validators';
import { activationExpiration, activationTokenGen } from '../utils/helpers';

class AuthController {
  async login(req: Request, resp: Response) {
    const errors = validateLogin(req);

    if (errors) {
      return resp.status(401).send({
        msg: errors,
        code: 406
      });
    }
    try {
      const user: User = await UserService.findByEmail(req.body.email);
      if (!user) {
        return resp.status(404).send({
          msg: 'User not found',
          code: 404
        });
      }
      const isSamePass = await UserService.comparePassword(req.body.password, user.password);
      if (isSamePass) {
        const token = jwt.sign({
          email: user.email,
          role: user.role,
          username: user.username,
          user_id: user.user_id
        }, process.env.JWT_SECRET, {expiresIn: '1h'});
        return resp.status(200).send({token: token});
      } else {
        return resp.status(401).send({
          msg: 'Unauthorized',
          status: 401
        });
      }
    } catch (error) {
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async register(req: Request, res: Response, _next: NextFunction) {
    const errors = validateRegister(req);

    if (errors) {
      return res.status(401).send({
        msg: errors,
        status: 401
      });
    }
    const user: User = req.body;
    try {
      // Check if user already exists
      const existingUser = await UserService.findByUsernameOrEmail(user.username, user.email);
      if (existingUser) {
        return res.status(409).send({
          msg: 'User already exists',
          status: 409
        });
      }
      // Generate activation token
      user.activationToken = await activationTokenGen();
      user.activationExpires = activationExpiration(); // does nothing at this point
      // Send activation email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMPT_PORT),
        logger: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: process.env.SMTP_USER,
        subject: 'Account activation',
        text: `You are receiving this email because you (or someone else) have requested account activation.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/auth/activate/${user.activationToken}\n\n
          If you did not request this, please ignore this email\n`
      };
      await transporter.sendMail(mailOptions);
      const savedUser: User = await UserService.save(user);
      res.status(201).send(savedUser);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        msg: 'Unable to send email',
        status: 400
      });
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const activationToken = req.user ? req.user.activationToken : req.params.activationToken;
      const user: User = await UserService.activateUser(activationToken);
      const token = jwt.sign({
        email: user.email,
        role: user.role,
        username: user.username,
        user_id: user.user_id
      }, process.env.JWT_SECRET, {expiresIn: '1h'});
      return res.status(200).send({token: token});
    } catch (error) {
      console.log(error);
      res.status(400).send({
        msg: 'Activation token expired, please register again',
        status: 400
      });
    }
  }

}

export default new AuthController();
