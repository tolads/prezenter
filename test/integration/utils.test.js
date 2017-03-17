import assert from 'assert';

import { formatDate } from '../../views/jsx/utils';

describe('formatDate()', () => {
  it('should return formatted date string', () => {
    assert.equal(formatDate(new Date(1489505640450)), '2017.03.14. 16:34');
    assert.equal(formatDate(new Date(1514761199999)), '2017.12.31. 23:59');
  });
});
