import 'whatwg-fetch';

/**
 * Format given date, e.x. 2017.03.20. 18:47
 * @param {Date} date
 * @return {String}
 */
export function formatDate(date) {
  return date.getFullYear() + '.' +
        (date.getMonth() < 10 ? '0' : '') +
        (date.getMonth() + 1) + '.' +
        (date.getDate() < 10 ? '0' : '') +
         date.getDate() + '. ' +
         date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' : '') +
         date.getMinutes();
}

/**
 * Requests a URL, returns a promise
 * @param  {string} url       The URL we want to request
 * @param  {object} options The options we want to pass to "fetch"
 * @return {Promise}           The request promise
 */
export function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    fetch(url, Object.assign({}, options, { credentials: 'same-origin' }))
      .then((response) => {
        try {
          const jsonResponse = response.json();

          if (!response.ok) {
            return new Promise(() => jsonResponse
              .then(json => reject({
                status: response.status,
                json,
              }))
              .catch(() => reject({
                status: response.status,
                json: {},
              })),
            );
          }

          return resolve(jsonResponse);
        } catch (err) {
          return reject({});
        }
      })
      .catch(() => reject({}));
  });
}
