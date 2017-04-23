/**
 * Check date validity
 * @param  {number} d The number value to test
 * @return {boolean}
 */
export const isDate = d => Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d);

/**
 * Check date validity
 * @param  {string} s The string value to test
 * @return {boolean}
 */
export const isDateString = s => isDate(new Date(s));
