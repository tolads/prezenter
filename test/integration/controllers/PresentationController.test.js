import request from 'supertest';
import { assert } from 'chai';
import { isDateString } from '../../testutils';

describe('PresentationController', () => {
  let authAgent; // common agent for authenticated requests
  let userId;

  /** create authenticated session for common agent */
  before((done) => {
    authAgent = request.agent(sails.hooks.http.app);
    authAgent
      .post('/users/login')
      .send({ username: 'a', password: 'a' })
      .end(() => {
        Users.findOne({
          username: 'a',
        })
          .then((user) => { userId = user.id; done(); })
          .catch(done);
      });
  });

  after((done) => {
    authAgent
      .get('/users/logout')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  /** POST /presentations/new */
  describe('#new()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .post('/presentations/new')
        .send({ newPresentationName: 'newPresentation', newPresentationDesc: 'newPresentationDesc' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Presentations.findOne({
            owner: userId,
            name: 'newPresentation',
          })
            .then((presentation) => {
              assert.isDefined(presentation, 'New presentation should have been created');
              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/presentations/new')
        .send({ newPresentationName: 'newPresentation', newPresentationDesc: 'newPresentationDesc' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** DELETE /presentations/:id */
  describe('#delete()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .delete('/presentations/2')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Promise.all([
            new Promise((resolve, reject) => {
              Presentations.findOne({
                owner: userId,
                id: 2,
              })
                .then((presentation) => {
                  assert.isUndefined(presentation, 'Presentation should be deleted');
                  resolve();
                })
                .catch(reject);
            }),
            new Promise((resolve, reject) => {
              Reports.find({
                presentation: 2,
              })
                .then((reports) => {
                  assert.lengthOf(reports, 0, 'Presentation\'s reports should be deleted');
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
        .delete('/presentations/2')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /presentations/list */
  describe('#list()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .get('/presentations/list')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, { body }) => {
          assert.typeOf(body, 'array', 'Response should be an array');
          assert.isAtLeast(body.length, 2, 'Response array should be longer');

          body.forEach((presentation) => {
            assert.typeOf(presentation.id, 'number', 'Attribute id should be a number');
            assert.typeOf(presentation.name, 'string', 'Attribute name should be a string');
            assert.ok(isDateString(presentation.date), 'Attribute date should be a date');
            assert.ok(isDateString(presentation.modified), 'Attribute date should be a date');
            assert.typeOf(presentation.canBePlayed, 'boolean', 'Attribute canBePlayed should be a boolean');
            assert.typeOf(presentation.hasReports, 'boolean', 'Attribute hasReports should be a boolean');
          });

          done();
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/presentations/list')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /presentations/get/:id */
  describe('#get()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .get('/presentations/get/1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, { body }) => {
          assert.typeOf(body, 'object', 'Response should be an object');
          assert.typeOf(body.name, 'string', 'Attribute name should be a string');
          assert.typeOf(body.reports, 'array', 'Attribute reports should be an array');

          done();
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/presentations/get/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** POST /presentations/edit/:id */
  describe('#edit()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .post('/presentations/edit/1')
        .send({ name: 'NewName', desc: 'NewDesc' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Presentations.findOne({
            owner: userId,
            id: 1,
          })
            .then((presentation) => {
              assert.isDefined(presentation, 'Presentation should exist');
              assert.strictEqual(presentation.name, 'NewName', 'Presentation should be renamed');
              assert.strictEqual(presentation.desc, 'NewDesc', 'Presentation desc should have changed');
              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/presentations/edit/1')
        .send({ name: 'newName', desc: 'newDesc' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /presentations/connect/:pid/:gid */
  describe('#connect()', () => {
    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/presentations/connect/1/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /presentations/getslide/:pid/:id */
  describe('#getSlide()', () => {
    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/presentations/getslide/1/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** POST /presentations/app/:pid/:name */
  describe('#app()', () => {
    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/presentations/app/1/messageboard')
        .send({ message: 'msg' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /presentations/listactive */
  describe('#listActive()', () => {
    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/presentations/listactive')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });
});
