import { assert } from 'chai';
import { isDate } from '../../testutils';

describe('UsersModel', () => {
  describe('#find()', () => {
    it('should check find function', (done) => {
      Users.find()
        .then((users) => {
          assert.isAtLeast(users.length, 2, 'Line number in Users table is not correct');
          users.forEach((user) => {
            assert.typeOf(user.id, 'number', 'Attribute id should be a number');
            assert.typeOf(user.username, 'string', 'Attribute username should be a string');
            assert.typeOf(user.fullname, 'string', 'Attribute fullname should be a string');
            assert.typeOf(user.password, 'string', 'Attribute password should be a string');
            assert.ok(isDate(user.createdAt), 'Attribute createdAt should be a date');
            assert.ok(isDate(user.updatedAt), 'Attribute updatedAt should be a date');
          });

          done();
        })
        .catch(done);
    });
  });

  describe('#signup()', () => {
    it('should check signup function', (done) => {
      Users.signup({ username: 'd', fullname: 'D D', password: 'd' })
        .then((newUser) => {
          assert.equal(newUser.username, 'd', 'Attribute username is not correct');
          assert.equal(newUser.fullname, 'D D', 'Attribute fullname is not correct');
          assert.isAtLeast(newUser.createdAt.getTime(), new Date().getTime() - 1000, 'Attribute createdAt is not correct');
          assert.isAtMost(newUser.createdAt.getTime(), new Date().getTime() + 1000, 'Attribute createdAt is not correct');
          assert.isAtLeast(newUser.updatedAt.getTime(), new Date().getTime() - 1000, 'Attribute updatedAt is not correct');
          assert.isAtMost(newUser.updatedAt.getTime(), new Date().getTime() + 1000, 'Attribute updatedAt is not correct');

          done();
        })
        .catch(done);
    });
  });

  describe('#attemptLogin', () => {
    it('should check attemptLogin function', (done) => {
      Users.attemptLogin({ username: 'd', password: 'd' })
        .then((user) => {
          assert.equal(user && user.username, 'd', 'Failed to login');

          done();
        })
        .catch(done);
    });
  });
});
