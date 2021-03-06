import * as mongoose from 'mongoose';
import { TodoMdl } from '../models/todo.mdl';
import * as uniqId from 'uniqid';

export type TodoType = mongoose.Document & TodoMdl;

const TodoSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  username: String,
  todo_id: String,
  master: Boolean,
  master_id: String,
  thumbs_up: Number,
  thumbs_down: Number,
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
  comments: [
    {
      user_id: String,
      text: String,
      date: String
    }
  ],
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
}, {timestamps: true, versionKey: false});

TodoSchema.index({
  'username': 'text',
  'title': 'text',
  'description': 'text',
  'category': 'text'
}, {
  weights: {
    username: 1,
    title: 2,
    description: 3,
    category: 4
  }
});

TodoSchema.pre('save', function save (next) {
  const todo: TodoMdl = this;
  addId(todo);
  next();
});

type TodoType = TodoMdl & mongoose.Document;
const TodoRepository = mongoose.model<TodoType>('TodoMdl', TodoSchema);
export default TodoRepository;

function addId (todo: TodoMdl): void {
  if (!todo.hasOwnProperty('todo_id')) {
    const todoId = uniqId('todo-');
    todo.todo_id = todoId;
    todo.master_id = todoId;
    todo.master = true;
  }

  if (!todo.hasOwnProperty('thumbs_up')) {
    todo.thumbs_up = 0;
  }

  if (!todo.hasOwnProperty('thumbs_down')) {
    todo.thumbs_down = 0;
  }
}