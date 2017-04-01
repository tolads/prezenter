import { assert } from 'chai';
import { isDate } from '../../testutils';

describe('ReportsModel', () => {
  describe('#find()', () => {
    it('should check find function', (done) => {
      Reports.find()
        .populate('presentation')
        .then((reports) => {
          assert.isAtLeast(reports.length, 2, 'Line number in Reports table is not correct');
          reports.forEach((report) => {
            assert.typeOf(report.id, 'number', 'Attribute id should be a number');
            assert.typeOf(report.app, 'string', 'Attribute app should be a string');
            assert.typeOf(report.start, 'string', 'Attribute start should be a string');
            assert.typeOf(report.presentation && report.presentation.id, 'number', 'Attribute presentation should be a Presentation');
            assert.typeOf(report.slide, 'number', 'Attribute slide should be a number');
            assert.typeOf(report.content, 'object', 'Attribute content should be an object');
            assert.ok(isDate(report.createdAt), 'Attribute createdAt should be a date');
            assert.ok(isDate(report.updatedAt), 'Attribute updatedAt should be a date');
          });

          done();
        })
        .catch(done);
    });
  });
});
