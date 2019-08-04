import { Request, Response } from 'express';

export interface AuthControllerType {
  emailExistsCheck<T>(req: Request, resp: Response): Promise<T>

  usernameExistsCheck<T>(req: Request, resp: Response): Promise<T>

  login<T>(req: Request, resp: Response): Promise<T>

  register<T>(req: Request, res: Response): Promise<T> 

  activate<T>(req: Request, res: Response): Promise<T> 
}