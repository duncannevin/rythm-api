import { TodoItem } from './todo-item';

export interface Todo {
  user_id: string;
  username: string;
  todo_id?: string;
  master?: boolean;
  master_id?: string;
  private: boolean;
  title: string;
  description: string;
  category: string;
  list: Array<TodoItem>;
}
