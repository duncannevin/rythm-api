import { Request, Response } from 'express';

export interface TodoControllerType {
  insertTodo<T>(req: Request, resp: Response): Promise<T>

  getTodos<T>(req: Request, resp: Response): Promise<T>

  insertMany<T>(req: Request, resp: Response): Promise<T>

  editTodo<T>(req: Request, resp: Response): Promise<T>

  thumbs<T>(req: Request, resp: Response): Promise<T>

  comment<T>(req: Request, resp: Response): Promise<T>

  deleteTodo<T>(req: Request, resp: Response): Promise<T>
}
