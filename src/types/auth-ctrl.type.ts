import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';

export interface AuthControllerType {
  emailExistsCheck<T>(req: Request, resp: Response): Promise<T>

  usernameExistsCheck<T>(req: Request, resp: Response): Promise<T>

  register<T>(req: Request, res: Response, next: NextFunction): Promise<T> 

  activate<T>(req: Request, res: Response): Promise<T> 
}