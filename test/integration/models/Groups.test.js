import { assert } from 'chai';
import { isDate } from '../../testutils';

describe('GroupsModel', () => {
  describe('#find()', () => {
    it('should check find function', (done) => {
      Groups.find()
        .populate('owner')
        .then((groups) => {
          assert.isAtLeast(groups.length, 2, 'Line number in Groups table is not correct');
          groups.forEach((group) => {
            assert.typeOf(group.id, 'number', 'Attribute id should be a number');
            assert.typeOf(group.name, 'string', 'Attribute name should be a string');
            assert.typeOf(group.owner && group.owner.id, 'number', 'Attribute owner should be a User');
            assert.ok(isDate(group.createdAt), 'Attribute createdAt should be a date');
            assert.ok(isDate(group.updatedAt), 'Attribute updatedAt should be a date');
          });

          done();
        })
        .catch(done);
    });
  });
});
