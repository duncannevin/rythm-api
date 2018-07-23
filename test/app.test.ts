import * as request from 'supertest';
import * as app from '../src/app';
import { default as UserService } from '../src/services/user.srvc';
import { default as TodoService } from '../src/services/todo.srvc';
import { User } from '../src/models/user';
import { Route } from '../src/types';
import { Todo } from '../src/models/todo';

const userForm = {
  email: 'tester@chester.com',
  password: 'PASSWORD',
  lname: 'Tester',
  fname: 'Chester',
  role: 'guest',
  username: 'testerchester'
};

const todoForm = {
  user_id: 'todo-1234',
  username: userForm.username,
  private: true,
  title: 'getten it done',
  description: 'mississippi',
  category: 'done',
  list: [
    {
      'item_name': 'string',
      'instructions': [
        'string'
      ],
      'status': 'string'
    }
  ]
};

afterAll((done) => {
  try {
    UserService.deleteOne(userForm.username);
    TodoService.deleteUsersTodos(userForm.username);
    done();
  } catch (error) {
    console.error(error);
  }
});

let user: User;
let JWT: string;

describe('/auth', () => {
  describe('POST /register', () => {
    const route: Route = '/auth/register';

    it('should return 201', (done) => {
      request(app).post(route)
        .send(userForm)
        .then(res => {
          user = res.body;
          expect(res.status).toEqual(201);
          expect(user).toHaveProperty('user_id');
          done();
        });
    });

    it('should return 409', (done) => {
      request(app).post(route)
        .send(userForm).expect(409, done);
    });
  });

  describe('GET /activate/:activationToken', () => {
    const route: Route = '/auth/activate';
    const BAD_TOKEN: String = '123456789';

    it('should return 400', (done) => {
      request(app).get(`${route}/${BAD_TOKEN}`)
        .expect(400, done);
    });

    it('should return 200', (done) => {
      request(app).get(`${route}/${user.activationToken}`)
        .then(res => {
          JWT = res.body.token;
          expect(res.status).toEqual(200);
          done();
        });
    });
  });

  describe('POST /login', () => {
    const route: Route = '/auth/login';

    it ('should return 401, missing password', (done) => {
      request(app).post(route).send({email: 'some@email.com'})
        .expect(401, done);
    });

    it('should return 401, missing email', (done) => {
      request(app).post(route).send({password: 'somepassword'})
        .expect(401, done);
    });

    it('should return 404', (done) => {
      request(app).post(route).send({email: 'none@nowhere.com', password: 'PASSWORD'})
        .expect(404, done);
    });

    it('should return 200', (done) => {
      request(app).post('/auth/login').send({email: 'tester@chester.com', password: 'PASSWORD'})
        .expect(200, done);
    });
  });
});

describe('GET /users', () => {
  const route: Route = '/users';

  it('should return 401', (done) => {
    request(app).get(route)
      .expect(401, done);
  });

  it('should return 200', (done) => {
    request(app).get(route)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200, done);
  });
});

describe('/todo', () => {
  let todo: Todo;

  describe('POST /insert', () => {
    const route: Route = '/todo/insert';

    it('should return 401', (done) => {
      request(app).post(route)
        .expect(401, done);
    });

    it('should return 201', (done) => {
      request(app).post(route)
        .send(todoForm)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          todo = res.body;
          expect(res.status).toBe(201);
          done();
        });
    });

    it('should have todo_id', (done) => {
      expect(todo).toHaveProperty('todo_id');
      done();
    });

    it('should have master_id', (done) => {
      expect(todo).toHaveProperty('master_id');
      done();
    });

    it('should have master set to true', (done) => {
      expect(todo.master).toBe(true);
      done();
    });
  });

  describe('GET /query', () => {
    const route: Route = '/todo/query';

    it('should return 401', (done) => {
      request(app).get(route)
        .expect(401, done);
    });

    it('should return 200', (done) => {
      request(app).get(route)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(200, done);
    });

    it('should return a todo by todo_id', (done) => {
      request(app).get(`${route}?todo_id=${todo.todo_id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          const resTodo = res.body;
          expect(Array.isArray(resTodo)).toBe(true);
          expect(resTodo.length).toEqual(1);
          expect(resTodo[0].todo_id).toEqual(todo.todo_id);
          expect(res.status).toEqual(200);
          done();
        });
    });

    it('should return a list of todos by category', (done) => {
      request(app).get(`${route}?category=${todo.category}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body[0].category).toEqual(todo.category);
          done();
        });
    });

    it ('should return a list of todos by user_id', (done) => {
      request(app).get(`${route}?user_id=${todo.user_id}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body[0].user_id).toEqual(todo.user_id);
          done();
        });
    });

    it ('should return a list of todos by username', (done) => {
      request(app).get(`${route}?username=${todo.username}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body[0].username).toEqual(todo.username);
          done();
        });
    });

    it ('should be able to handle a complex query', (done) => {
      request(app).get(`${route}?todo_id=${todo.todo_id}&user_id=${todo.user_id}&category=${todo.category}&username=${todo.username}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          const list = res.body;
          expect(res.status).toEqual(200);
          expect(list[0].todo_id).toEqual(todo.todo_id);
          expect(list[0].user_id).toEqual(todo.user_id);
          expect(list[0].category).toEqual(todo.category);
          expect(list[0].username).toEqual(todo.username);
          done();
        });
    });

    it ('should be able to do a search', (done) => {
      request(app).get(`${route}?search=${todo.title}`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body[0].title).toEqual(todo.title);
          done();
        });
    });
  });

  describe('PUT /edit', () => {
    const route: Route = '/todo/edit';

    it('should return 401', (done) => {
      request(app).put(route)
        .expect(401, done);
    });
  });

  describe('DELETE /remove/:todoId', () => {
    const route: Route = '/todo/remove';

    it('should return 401', (done) => {
      request(app).delete(route)
        .expect(401, done);
    });
  });
});