import { assert } from 'chai';
import { isDate } from '../../testutils';

describe('PresentationsModel', () => {
  describe('#find()', () => {
    it('should check find function', (done) => {
      Presentations.find()
        .populate('owner')
        .then((presentations) => {
          assert.isAtLeast(presentations.length, 2, 'Line number in Presentations table is not correct');
          presentations.forEach((presentation) => {
            assert.typeOf(presentation.id, 'number', 'Attribute id should be a number');
            assert.typeOf(presentation.name, 'string', 'Attribute name should be a string');
            assert.typeOf(presentation.owner && presentation.owner.id, 'number', 'Attribute owner should be a User');
            assert.ok(isDate(presentation.createdAt), 'Attribute createdAt should be a date');
            assert.ok(isDate(presentation.updatedAt), 'Attribute updatedAt should be a date');
          });

          done();
        })
        .catch(done);
    });
  });
});
