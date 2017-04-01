import request from 'supertest';
import { assert } from 'chai';

describe('GroupController', () => {
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

  /** POST /groups/new */
  describe('#new()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .post('/groups/new')
        .send({ newGroupName: 'newGroup' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Groups.findOne({
            owner: userId,
            name: 'newGroup',
          })
            .then((group) => {
              assert.isDefined(group, 'New group should have been created');
              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/groups/new')
        .send({ newGroupName: 'newGroup' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** POST /groups/add */
  describe('#add()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .post('/groups/add')
        .send({ addToGroup: '1', 'userIDs[]': '1' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Groups.findOne({
            owner: userId,
            id: 1,
          }).populate('members')
            .then((group) => {
              assert.isDefined(group, 'Group should exist');
              assert.isAtLeast(group.members && group.members.length, 1, 'Member should have been added');

              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/groups/add')
        .send({ addToGroup: '1', 'userIDs[]': '1' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** DELETE /groups/group/:id */
  describe('#deleteGroup()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .delete('/groups/group/2')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Groups.findOne({
            owner: userId,
            id: 2,
          })
            .then((group) => {
              assert.isUndefined(group, 'Group should have been deleted');
              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .delete('/groups/group/2')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** DELETE /groups/group/:gid/member/:uid */
  describe('#deleteMember()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .delete('/groups/group/1/member/1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Groups.findOne({
            owner: userId,
            id: 1,
          }).populate('members')
            .then((group) => {
              assert.isDefined(group, 'Group should exist');
              assert.isUndefined(group.members && group.members.find(member => member.id === 1), 'Member should not exist');

              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .delete('/groups/group/1/member/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** GET /groups/list */
  describe('#list()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .get('/groups/list')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, { body }) => {
          assert.typeOf(body, 'array', 'Response should be an array');
          assert.isAtLeast(body.length, 2, 'Response array should be longer');

          body.forEach((group) => {
            assert.typeOf(group.id, 'number', 'Attribute id should be a number');
            assert.typeOf(group.name, 'string', 'Attribute name should be a string');
            assert.typeOf(group.members, 'array', 'Attribute members should be an array');
          });

          done();
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .get('/groups/list')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });

  /** POST /groups/rename */
  describe('#rename()', () => {
    it('should return HTTP 200', (done) => {
      authAgent
        .post('/groups/rename')
        .send({ id: 1, name: 'NewName' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(() => {
          Groups.findOne({
            owner: userId,
            id: 1,
          })
            .then((group) => {
              assert.isDefined(group, 'Group should exist');
              assert.strictEqual(group.name, 'NewName', 'Group should be renamed');

              done();
            })
            .catch(done);
        });
    });

    it('should return HTTP 401', (done) => {
      request(sails.hooks.http.app)
        .post('/groups/rename')
        .send({ id: 1, name: 'NewName' })
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
  });
});
