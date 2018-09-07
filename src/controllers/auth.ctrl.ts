import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { UserMdl } from '../models/user.mdl';
import { default as UserService } from '../services/user.srvc';
import { validateLogin, validateRegister } from '../utils/validators.utl';
import { activationExpiration, activationTokenGen } from '../utils/helpers.utl';
import { authLogger } from '../utils/loggers.utl';
import { Email, Username } from '../types/general-types';

class AuthController {
  async emailExistsCheck(req: Request, resp: Response) {
    try {
      const possibleEmail: Email = req.params.email;
      const maybeUser: UserMdl = await UserService.findByEmail(possibleEmail);
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

  async usernameExistsCheck(req: Request, resp: Response) {
    try {
      const possibleUsername: Username = req.params.username;
      const maybeUser: UserMdl = await UserService.findByUsername(possibleUsername);
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

  async login(req: Request, resp: Response) {
    const validationErrors = validateLogin(req);
    if (validationErrors) {
      authLogger.debug('login validation errors', validationErrors);
      return resp.status(401).send({
        msg: validationErrors,
        code: 406
      });
    }
    try {
      const user: UserMdl = await UserService.findByEmail(req.body.email);
      if (!user) {
        authLogger.debug('login user does not exist');
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
        authLogger.info('login successful');
        return resp.status(200).send({token: token});
      } else {
        authLogger.debug('login unauthorized');
        return resp.status(401).send({
          msg: 'Unauthorized',
          status: 401
        });
      }
    } catch (error) {
      authLogger.debug('login failed', error);
      return resp.status(400).send({
        msg: error,
        code: 400
      });
    }
  }

  async register(req: Request, res: Response, _next: NextFunction) {
    const validationErrors = validateRegister(req);

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
      const existingUser = await UserService.findByUsernameOrEmail(user.username, user.email);
      if (existingUser) {
        authLogger.debug('register user already exists', existingUser.user_id);
        return res.status(409).send({
          msg: 'UserMdl already exists',
          status: 409
        });
      }
      // Generate activation token
      user.activationToken = await activationTokenGen();
      user.activationExpires = activationExpiration(); // does nothing at this point (not sure I will ever implement)
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
        subject: 'Rythm account activation',
        text: `You are receiving this email because you (or someone else) have requested account activation with Rythm.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/auth/activate/${user.activationToken}\n\n
          If you did not request this, please ignore this email\n`
      };
      await transporter.sendMail(mailOptions);
      authLogger.info('register email sent');
      const savedUser: UserMdl = await UserService.save(user);
      authLogger.info('register successful');
      res.status(201).send(savedUser);
    } catch (error) {
      authLogger.debug('register failed', error);
      res.status(400).send({
        msg: 'Unable to send email',
        status: 400
      });
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const activationToken = req.user ? req.user.activationToken : req.params.activationToken;
      const user: UserMdl = await UserService.activateUser(activationToken);
      const token = jwt.sign({
        email: user.email,
        role: user.role,
        profile: user.profile,
        username: user.username,
        user_id: user.user_id
      }, process.env.JWT_SECRET, {expiresIn: '1h'});
      authLogger.info('activate successful');
      return res.status(200).send({token: token});
    } catch (error) {
      authLogger.debug('activate failed', error);
      res.status(400).send({
        msg: 'Activation token expired, please register again',
        status: 400
      });
    }
  }
}

export default new AuthController();
