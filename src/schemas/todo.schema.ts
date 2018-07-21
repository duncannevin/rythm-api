import * as mongoose from 'mongoose';
import { Todo } from '../models/todo';
import * as uniqId from 'uniqid';

export type TodoType = mongoose.Document & Todo;

const TodoSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  todo_id: String,
  master: Boolean,
  master_id: String,
  private: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  list: {
    type: Array,
    default: [
      {
        item_name: {
          type: String,
          require: true
        },
        status: {
          type: String,
          require: true
        },
        instructions: [String]
      }
    ],
    required: true
  },
}, {timestamps: true});

TodoSchema.pre('save', function save (next) {
  const todo: Todo = this;
  if (!todo.hasOwnProperty('todo_id')) {
    const todoId = uniqId('todo-');
    todo.todo_id = todoId;
    todo.master_id = todoId;
    todo.master = true;
  }
  next();
});

type TodoType = Todo & mongoose.Document;
const TodoRepository = mongoose.model<TodoType>('Todo', TodoSchema);
export default TodoRepository;