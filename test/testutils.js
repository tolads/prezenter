export const isDate = d => Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d);
export const isDateString = s => isDate(new Date(s));
