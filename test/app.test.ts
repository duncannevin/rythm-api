import * as request from 'supertest';
import * as app from '../src/app';

describe('GET /random-url', () => {
  it('should return 401', (done) => {
    request(app).get('/reset')
      .expect(401, done);
  });
});
