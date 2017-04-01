import request from 'supertest';
import { assert } from 'chai';
import { isDateString } from '../../testutils';

describe('UserController', () => {
  let authAgent; // common agent for authenticated requests

  /** create authenticated session for common agent */
  before((done) => {
    authAgent = request.agent(sails.hooks.http.app);
    authAgent
      .post('/users/login')
      .send({ username: 'a', password: 'a' })
      .end(done);
  });

  after((done) => {
    authAgent
      .get('/users/logout')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  /** GET /users/isloggedin */
  describe('#isLoggedIn()', () => {
    it('should return false', (done) => {
      request(sails.hooks.http.app)
        .get('/users/isloggedin')
        .expect('Content-Type', /json/)
        .expect(200, {
          loggedin: false,
        })
        .end(done);
    });

    it('should return "a"', (done) => {
      authAgent
        .get('/users/isloggedin')
        .expect('Content-Type', /json/)
        .expect(200, {
          loggedin: 'a',
        })
        .end(done);
    });
  });

  /** POST /users/login */
  describe('#login()', () => {
    it('should return HTTP 200', (done) => {
      request(sails.hooks.http.app)
        .post('/users/login')
        .send({ username: 'a', password: 'a' })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return HTTP 400', (done) => {
      request(sails.hooks.http.app)
        .post('/users/login')
        .send({ username: 'a', password: 'b' })
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
  });

  /** POST /users/signup */
  describe('#signup()', () => {
    it('should return HTTP 200', (done) => {
      request(sails.hooks.http.app)
        .post('/users/signup')
        .send({ username: 'e', password: 'e', fullname: 'E E' })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return HTTP 400', (done) => {
      request(sails.hooks.http.app)
        .post('/users/signup')
        .send({ username: 'e', password: 'f', fullname: 'F F' })
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
  });

  /** GET /users/list */
  describe('#list()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .get('/users/list')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, { body }) => {
          assert.typeOf(body, 'array', 'Response should be an array');
          assert.isAtLeast(body.length, 2, 'Response array should be longer');

          body.forEach((user) => {
            assert.typeOf(user.id, 'number', 'Attribute id should be a number');
            assert.typeOf(user.username, 'string', 'Attribute username should be a string');
            assert.typeOf(user.fullname, 'string', 'Attribute fullname should be a string');
            assert.ok(isDateString(user.date), 'Attribute date should be a date');
          });

          done();
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/users/list')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /users/me */
  describe('#me()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .get('/users/me')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, { body }) => {
          assert.typeOf(body, 'object', 'Response should be an object');
          assert.typeOf(body.username, 'string', 'Attribute username should be a string');
          assert.typeOf(body.fullname, 'string', 'Attribute fullname should be a string');
          assert.ok(isDateString(body.date), 'function', 'Attribute date should be a date');
          assert.typeOf(body.groups, 'number', 'Attribute groups should be a number');
          assert.typeOf(body.presentations, 'number', 'Attribute presentations should be a number');

          done();
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/users/me')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** DELETE /users/me */
  describe('#delete()', () => {
    let userId;

    before((done) => {
      authAgent
        .post('/users/login')
        .send({ username: 'b', password: 'b' })
        .expect(200)
        .end(() => {
          Users.findOne({
            username: 'b',
          })
            .then((user) => { userId = user.id; done(); })
            .catch(done);
        });
    });

    after((done) => {
      authAgent
        .post('/users/login')
        .send({ username: 'a', password: 'a' })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return HTTP 200', (done) => {
      authAgent
        .delete('/users/me')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Promise.all([
            new Promise((resolve, reject) => {
              Users.findOne({
                id: userId,
              })
                .then((user) => {
                  assert.isUndefined(user, 'User "b" should be deleted');
                  resolve();
                })
                .catch(reject);
            }),
            new Promise((resolve, reject) => {
              Groups.find({
                owner: userId,
              })
                .then((groups) => {
                  assert.lengthOf(groups, 0, 'User "b"\'s groups should be deleted');
                  resolve();
                })
                .catch(reject);
            }),
            new Promise((resolve, reject) => {
              Presentations.find({
                owner: userId,
              })
                .then((presentations) => {
                  assert.lengthOf(presentations, 0, 'User "b"\'s presentations should be deleted');
                  resolve();
                })
                .catch(reject);
            }),
          ])
            .then(() => done())
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .delete('/users/me')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });
});
