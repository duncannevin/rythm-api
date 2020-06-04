import 'reflect-metadata';

import * as mongoose from 'mongoose';

import { UserService } from '../../src/services/user.srvc';
import { mockMongoose } from '../mocks/mock.mongoose';
import { UserMdl } from '../../src/models/user.mdl';

import { mockUsers } from '../mocks/mock.users';
import { ObjectID } from 'bson';

describe('User Service', function () {
  const userModel: UserMdl = { username: 'testerchester', email: 'tester@chester.com', password: 'qwerty1!', role: 'visitor' }
  let userService: UserService;
  let savedUsers: UserMdl[];

  beforeAll(async () => {
    await mockMongoose();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    userService = new UserService();
    savedUsers = await userService.repository.create(mockUsers) as UserMdl[];
  });

  afterEach(async () => {
    await userService.repository.deleteMany({});
  });

  it('findById: should find a user', async function () {
    const lookupUser = savedUsers[1];
    const foundUser = await userService.findById(lookupUser._id);

    expect(foundUser).toBeTruthy();
    expect(foundUser._id).toEqual(lookupUser._id);
  });

  it('findByEmail: should find a user', async function () {
    const lookupUser = savedUsers[0];
    const foundUser = await userService.findByEmail(lookupUser.email);

    expect(foundUser).toBeTruthy();
    expect(foundUser._id).toEqual(lookupUser._id);
  });


  it('findByUsername: should find a user', async function () {
    const lookupUser = savedUsers[0];
    const foundUser = await userService.findByUsername(lookupUser.username);

    expect(foundUser).toBeTruthy();
    expect(foundUser._id).toEqual(lookupUser._id);
  });

  it('findByUsernameOrEmail: should find a user', async function () {
    const lookupUser = savedUsers[1];
    const foundUser = await userService.findByUsernameOrEmail(lookupUser.username, 'not@email');
    const foundUser2 = await userService.findByUsernameOrEmail('notaname', lookupUser.email);

    expect(foundUser).toBeTruthy();
    expect(foundUser._id).toEqual(lookupUser._id);
    expect(foundUser2).toBeTruthy();
    expect(foundUser2._id).toEqual(lookupUser._id);
  });

  it('findByUserId: should find a user', async function () {
    const lookupUser = savedUsers[0];
    const foundUser = await userService.findByUserId(lookupUser.user_id);

    expect(foundUser).toBeTruthy();
    expect(foundUser._id).toEqual(lookupUser._id);
  });

  it('save: should save a user', async function () {
    const savedUser = await userService.save(userModel);

    expect(savedUser).toBeTruthy();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toEqual(userModel.email);
  });

  it('updateOrCreate: should update an existing user', async function () {
    const existingUser = savedUsers[0];
    existingUser.username = 'notausername';
    const updatedUser = await userService.updateOrCreate(existingUser);

    expect(updatedUser).not.toEqual(existingUser);
    expect(updatedUser._id).toEqual(existingUser._id);
    expect(updatedUser.username).toEqual(existingUser.username);
  });

  it('updateOrCreate: should add a new user', async function () {
    const updatedUser = await userService.updateOrCreate(userModel);

    expect(updatedUser.email).toEqual(userModel.email);
    expect(updatedUser.username).toEqual(userModel.username);
  });

  it('removeLiked: should remove a like', async function () {
    const removeUser = savedUsers[1];
    const removedLiked = await userService.removeLiked(removeUser.user_id, removeUser.liked[2]);

    expect(removedLiked.liked.length).toBe(removeUser.liked.length - 1);
    expect(removedLiked.liked.includes(removeUser.liked[2])).toBe(false);
  });


  it('addLiked: should add a like', async function () {
    const addUser = savedUsers[0];
    const addLiked = await userService.addLiked(addUser.user_id, '111');

    expect(addLiked.liked.length).toBe(addUser.liked.length + 1);
    expect(addLiked.liked[addLiked.liked.length - 1]).toBe('111');
  });

  it('removeNotLiked: should remove a notLike', async function () {
    const removeUser = savedUsers[1];
    const removeNotLiked = await userService.removeNotLiked(removeUser.user_id, removeUser.notLiked[2]);

    expect(removeNotLiked.notLiked.length).toBe(removeUser.notLiked.length - 1);
    expect(removeNotLiked.notLiked.includes(removeUser.notLiked[2])).toBe(false);
  });


  it('addLiked: should add a like', async function () {
    const addUser = savedUsers[0];
    const addNotLiked = await userService.addNotLiked(addUser.user_id, '111');

    expect(addNotLiked.notLiked.length).toBe(addUser.notLiked.length + 1);
    expect(addNotLiked.notLiked[addNotLiked.notLiked.length - 1]).toBe('111');
  });

  it('findAll: should return all users', async function () {
    const users = await userService.findAll();

    expect(JSON.stringify(users.map(u => u.user_id))).toEqual(JSON.stringify(savedUsers.map(u => u.user_id)));
  });

  it('deleteOne: should delete a single user', async function () {
    const remove = savedUsers[1];
    try {
      const removed = await userService.deleteOne(remove.username);
      expect(remove).toBeTruthy();
    } catch (error) {
      fail(error);
    }
  });
});