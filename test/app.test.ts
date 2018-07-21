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