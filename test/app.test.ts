import * as request from 'supertest';
import * as app from '../src/app';
import { default as UserService } from '../src/services/user.srvc';
import { default as TodoService } from '../src/services/todo.srvc';
import { UserMdl } from '../src/models/user.mdl';
import { Route } from 'general-types.ts';
import { TodoMdl } from '../src/models/todo.mdl';
import { UserRegistrationMdl } from '../src/models/user-registration.mdl';

// @ts-ignore
import * as todos from '../todos.json';

const userForm: UserRegistrationMdl = {
  email: 'tester@chester.com',
  password: 'PASSWORD',
  lname: 'Tester',
  fname: 'Chester',
  role: 'guest',
  username: 'testerchester'
};

const todoForm: TodoMdl = {
  username: userForm.username,
  private: true,
  title: 'getten it done5153898847',
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

let user: UserMdl;
let JWT: string;
let insertedTodos: TodoMdl[];

beforeAll((done) => {
  done();
});

afterAll((done) => {
  try {
    UserService.deleteOne(userForm.username);
    TodoService.deleteUsersTodos(userForm.username);
    TodoService.deleteMany(insertedTodos.map(t => t.todo_id));
    done();
  } catch (error) {
    console.error(error);
  }
});

describe('/auth', () => {
  describe('POST /register', () => {
    const route: Route = '/auth/register';

    it('should return 201', (done) => {
      request(app).post(route)
        .send(userForm)
        .then(res => {
          user = res.body;
          todoForm.user_id = user.user_id;
          expect(res.status).toEqual(201);
          expect(user).toHaveProperty('user_id');
          expect(user).toHaveProperty('liked');
          expect(user).toHaveProperty('notLiked');
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

  it('should return 200 with a user', (done) => {
    request(app).get(`${route}/${user.user_id}`)
      .set('Authorization', `Bearer ${JWT}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('user_id');
        done();
      });
  });
});

describe('GET /auth/exists/username', () => {
  const route: Route = '/auth/exists/username';
  it('should return 200 with exists field false if username not exists', (done) => {
    request(app).get(`${route}/notarealuser`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(typeof res.body.exists).toBe('boolean');
        expect(res.body.exists).toEqual(false);
        done();
      });
  });

  it('should return 200 with exists field true if username exists', (done) => {
    request(app).get(`${route}/${user.username}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(typeof res.body.exists).toBe('boolean');
        expect(res.body.exists).toEqual(true);
        done();
      });
  });
});

describe('GET /auth/exists/email', () => {
  const route: Route = '/auth/exists/email';
  it('should return 200 with exists field false if email not exists', (done) => {
    request(app).get(`${route}/notarealuser@none.com`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(typeof res.body.exists).toBe('boolean');
        expect(res.body.exists).toEqual(false);
        done();
      });
  });

  it('should return 200 with exists field true if email exists', (done) => {
    request(app).get(`${route}/${user.email}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(typeof res.body.exists).toBe('boolean');
        expect(res.body.exists).toEqual(true);
        done();
      });
  });
});

describe('/todo', () => {
  let todo: TodoMdl;

  describe('POST /insertmany', () => {
    const route: Route = '/todo/insertmany';
    it ('should return 401', (done) => {
      request(app).post(route)
        .expect(401, done);
    });

    it ('should return 422 with no body', (done) => {
      request(app).post(route)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it ('should insert many todos, with todo_ids added', (done) => {
      request(app).post(route)
        .set('Authorization', `Bearer ${JWT}`)
        .send({todos: todos})
        .then((res) => {
          insertedTodos = res.body;
          expect(res.status).toEqual(201);
          expect(res.body.length).toEqual(todos.length);
          done();
        });
    });
  });

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

    it('should have a thumbs_up and thumbs_down properties set to 0', (done) => {
      expect(todo.thumbs_down).toEqual(0);
      expect(todo.thumbs_up).toEqual(0);
      done();
    });
  });

  describe('GET /query', () => {
    const route: Route = '/todo/query';

    it('should return 401', (done) => {
      request(app).get(route)
        .expect(401, done);
    });

    it('should return 422 with no query string', (done) => {
      request(app).get(route)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 422 with invalid query', (done) => {
      request(app).get(`${route}?bad=stuff`)
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
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
          expect(res.body.length).toEqual(1);
          expect(res.body[0].title).toEqual(todo.title);
          done();
        });
    });

    it ('should be able to search for many with same data in description', (done) => {
      request(app).get(`${route}?search=512EEA46CEB3921DFF4363C7069D89D4964D1D9FCCAA0F411851A7AA60A5C868`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.length).toEqual(3);
          done();
        });
    });

    it ('it should only find one with same description as others when adding user_id to query', (done) => {
      request(app).get(`${route}?user_id=test-4567&search=512EEA46CEB3921DFF4363C7069D89D4964D1D9FCCAA0F411851A7AA60A5C868`)
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.length).toEqual(1);
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

    it('should return 422', (done) => {
      request(app).put(route)
        .send({})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 401 when trying to update a todo not owned by caller', (done) => {
      request(app).put(route)
        .send({todo_id: insertedTodos[0].todo_id})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(401, done);
    });

    it('should return 404 if todo is not found in the system', (done) => {
      request(app).put(route)
        .send({todo_id: 'notinthesystem'})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(404, done);
    });

    it('should return 200 after updating the title', (done) => {
      const newTitle = 'This is a new title!';
      request(app).put(route)
        .send({todo_id: todo.todo_id, user_id: todo.user_id, title: newTitle})
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(newTitle);
          done();
        });
    });
  });

  describe('PUT /thumbs', () => {
    const route: Route = '/todo/thumbs';

    it('should return 401', (done) => {
      request(app).put(route)
        .expect(401, done);
    });

    it('should return 422 without thumb field', (done) => {
      request(app).put(route)
        .send({todo_id: insertedTodos[0].todo_id})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 422 with innapropriate thumb value', (done) => {
      request(app).put(route)
        .send({todo_id: insertedTodos[0].todo_id, thumb: 'notAthumb'})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 401 if attempting to rate self', (done) => {
      request(app).put(route)
        .send({todo_id: todo.todo_id, thumb: 'thumbUp'})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(401, done);
    });

    it('should return 404 if todo not in system', (done) => {
      request(app).put(route)
        .send({todo_id: 'notinthesystem', thumb: 'thumbDown'})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(404, done);
    });

    describe('Increase thumbs_up/thumbs_down them decrease thumbs_up/thumbs_down by calling same again', () => {
      it('should return 200 and increment thumbs_up by one', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[0].todo_id, thumb: 'thumbUp'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_up).toEqual(1);
            done();
          });
      });

      it('should return 200 and increment thumbs_down by one', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[1].todo_id, thumb: 'thumbDown'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_down).toEqual(1);
            done();
          });
      });

      it('user should have correct todoIds in like and notLiked fields', (done) => {
        request(app).get(`/users/${user.user_id}`)
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.notLiked).toHaveLength(1);
            expect(res.body.liked).toHaveLength(1);
            expect(res.body.notLiked).toContain(insertedTodos[1].todo_id);
            expect(res.body.liked).toContain(insertedTodos[0].todo_id);
            done();
          });
      });

      it('should decrement thumbs_up by one if same user calls thumbUp a second time', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[0].todo_id, thumb: 'thumbUp'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_up).toEqual(0);
            done();
          });
      });

      it('should decrement thumbs_down by one if same user calls thumbDown a second time', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[1].todo_id, thumb: 'thumbDown'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_down).toEqual(0);
            done();
          });
      });

      it('user should have empty liked and notLiked fields', (done) => {
        request(app).get(`/users/${user.user_id}`)
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            // expect(res.body.notLiked).toHaveLength(0);
            expect(res.body.liked).toHaveLength(0);
            done();
          });
      });
    });

    describe('Increase thumbs_up/thumbs_down then swap values if opposite called later', () => {
      it('should return 200 and increment thumbs_up by one', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[0].todo_id, thumb: 'thumbUp'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_up).toEqual(1);
            done();
          });
      });

      it('should return 200 and increment thumbs_down by one', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[0].todo_id, thumb: 'thumbDown'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_up).toEqual(0);
            expect(res.body.thumbs_down).toEqual(1);
            done();
          });
      });

      it('user should have a the correct todo_id in the notLiked field', (done) => {
        request(app).get(`/users/${user.user_id}`)
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.notLiked).toHaveLength(1);
            expect(res.body.liked).toHaveLength(0);
            expect(res.body.notLiked).toContain(insertedTodos[0].todo_id);
            done();
          });
      });

      it('should return 200 and increment thumbs_up by one', (done) => {
        request(app).put(route)
          .send({todo_id: insertedTodos[0].todo_id, thumb: 'thumbUp'})
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.thumbs_up).toEqual(1);
            done();
          });
      });

      it('user should have a the correct todo_id in the liked field', (done) => {
        request(app).get(`/users/${user.user_id}`)
          .set('Authorization', `Bearer ${JWT}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.notLiked).toHaveLength(0);
            expect(res.body.liked).toHaveLength(1);
            expect(res.body.liked).toContain(insertedTodos[0].todo_id);
            done();
          });
      });
    });
  });

  describe('POST /comment', () => {
    const route = '/todo/comment';

    it('should return 401', (done) => {
      request(app).post(route)
        .expect(401, done);
    });

    it('should return 422 with missing fields', (done) => {
      request(app).post(route)
        .send({})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 200 and insert a comment', (done) => {
      request(app).post(route)
        .send({todo_id: todo.todo_id, user_id: todos[0].user_id, text: 'This is good!'})
        .set('Authorization', `Bearer ${JWT}`)
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.comments).toHaveLength(1);
          expect(res.body.comments[0].user_id).toEqual(todos[0].user_id);
          expect(res.body.comments[0].text).toEqual('This is good!');
          done();
        });
    });
  });

  describe('DELETE /remove', () => {
    const route: Route = '/todo/remove';

    it('should return 401', (done) => {
      request(app).delete(route)
        .send({})
        .expect(401, done);
    });

    it('should return 422 without todoId in body', (done) => {
      request(app).delete(route)
        .send({})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(422, done);
    });

    it('should return 401 with non matching user_id', (done) => {
      request(app).delete(route)
        .send({user_id: todo.user_id, todo_id: insertedTodos[0].todo_id})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(401, done);
    });

    it('should return 404 if todo not in the system', (done) => {
      request(app).delete(route)
        .send({user_id: todo.user_id, todo_id: 'notinthesystem'})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(404, done);
    });

    it('should return 204 after deleting a todo from the system', (done) => {
      request(app).delete(route)
        .send({user_id: todo.user_id, todo_id: todo.todo_id})
        .set('Authorization', `Bearer ${JWT}`)
        .expect(204, done);
    });
  });
});