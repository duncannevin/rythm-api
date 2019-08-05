import 'reflect-metadata';

import * as mongoose from 'mongoose';

import { TodoService } from '../../src/services/todo.srvc';
import { mockMongoose } from '../mocks/mock.mongoose';
import { TodoMdl } from '../../src/models/todo.mdl';

import { mockTodos } from '../mocks/mock.todos';

describe('Todo Service', function () {
  const todoModel: TodoMdl = { user_id: '1234', category: 'bla', 'description': 'bla', title: 'bla', private: false }
  let todoService: TodoService;
  let savedTodos: TodoMdl[];

  beforeAll(async () => {
    await mockMongoose();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    todoService = new TodoService();
    savedTodos = await todoService.repository.create(mockTodos) as TodoMdl[];
  });

  afterEach(async () => {
    await todoService.repository.deleteMany({});
  });

  it('save: should save a document', async function () {
    const saved = await todoService.save(todoModel);

    expect(saved).toBeTruthy();
    expect(saved.todo_id).toBeDefined();
    expect(saved.todo_id.split('-')[0]).toBe('todo');
  });

  it('fetchAll: should fetch all documents', async function () {
    const allTodos = await todoService.fetchAll();

    expect(allTodos).toBeInstanceOf(Array);
    expect(allTodos).toHaveLength(savedTodos.length);
  });

  it('searchRepository: should find a document', async function () {
    const keyWord = savedTodos[2].description.split(' ')[1];
    const lookup = await todoService.searchRepository(keyWord, { user_id: mockTodos[2].user_id })

    expect(lookup).toBeInstanceOf(Array);
    expect(lookup[0].description).toEqual(savedTodos[2].description);
  });

  it('findOne: should find a single document', async function () {
    const lookupItem = savedTodos[0];
    const findIt = await todoService.findOne(lookupItem.todo_id);

    expect(findIt.todo_id).toEqual(lookupItem.todo_id);
    expect(findIt.user_id).toEqual(lookupItem.user_id);
  });

  it('thumbUp: should increment thumbs_up', async function () {
    const upItem = savedTodos[2];
    const updateIt = await todoService.thumbUp(upItem.todo_id);

    expect(updateIt.thumbs_up).toBe(upItem.thumbs_up + 1);
  });

  it('thumbDown: should increment thumbs_down', async function () {
    const upItem = savedTodos[2];
    const updateIt = await todoService.thumbDown(upItem.todo_id);

    expect(updateIt.thumbs_down).toBe(upItem.thumbs_down + 1);
  });

  it('decrementThumbUp: should decrement thumbs_up', async function () {
    const upItem = savedTodos[3];
    const updateIt = await todoService.decrementThumbUp(upItem.todo_id);

    expect(updateIt.thumbs_up).toBe(upItem.thumbs_up - 1);
  });

  it('decrementThumbDown: should decrement thumbs_down', async function () {
    const upItem = savedTodos[3];
    const updateIt = await todoService.decrementThumbDown(upItem.todo_id);

    expect(updateIt.thumbs_down).toBe(upItem.thumbs_down - 1);
  });

  it('insertComment: should insert a comment', async function () {
    const commentItem = savedTodos[2];
    const { user_id } = savedTodos[0];
    const comment = { user_id, text: 'this is a comment', date: 'date' };
    const added = await todoService.insertComment(commentItem.todo_id, comment);

    expect(added.comments).toBeDefined();
    expect(added.comments.find(c => c.date === comment.date))
  });

  it('insertMany: should insert many todos', async function () {
    const inserted = await todoService.insertMany(mockTodos);
    const allTodos = await todoService.repository.find();

    expect(allTodos.length).toEqual(savedTodos.length * 2);
  });

  it('updateOne: should update a single todo', async function () {
    const updateItem = savedTodos[3];
    updateItem.description = 'IT IS CHANGED NOW';
    const updated = await todoService.updateOne(updateItem);

    expect(updated.description).toBe(updateItem.description);
  });

  it('deleteOne: should delete a single todo', async function () {
    const deleteItem = savedTodos[1];
    const deleted = await todoService.deleteOne(deleteItem.todo_id);
    const shouldntExist = await todoService.repository.find(deleteItem);

    expect(shouldntExist.length).toBe(0);
  });

  it('deleteMany: should delete many todos', async function () {
    const deleteItems = savedTodos.slice(-2).map(t => t.todo_id);
    const deleted = await todoService.deleteMany(deleteItems);
    const todos = await todoService.repository.find();
    const lastTwo = todos.slice(-2);

    expect(lastTwo[0].todo_id).not.toEqual(deleteItems[0]);
    expect(lastTwo[1].todo_id).not.toEqual(deleteItems[1]);
  });

  it('deleteUserTodos: should delete a users todos', async function () {
    const deleteUser = mockTodos[0];
    const deleted = await todoService.deleteUsersTodos(deleteUser.user_id);
    const todos = await todoService.repository.find();
    const lookupUser = todos.find(t => t.user_id === deleteUser.user_id);

    expect(lookupUser).toBeFalsy();
  });
});
