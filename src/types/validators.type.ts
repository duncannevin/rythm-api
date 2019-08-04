import { Request } from 'express';

export interface ValidatorsType {
  validateInsertTodo(req: Request): any

  validateLogin (req: Request): any

  validateRegister (req: Request): any

  validateInsertTodos (req: Request): any

  validateTodoQuery (req: Request): any

  validateDelete (req: Request): any

  validateEditTodo (req: Request): any

  validateIncrementThumbs (req: Request): any

  validateSameUser(req: Request): Promise<any>

  validateDifferentUser (req: Request): Promise<any>

  validateComment (req: Request): any
}