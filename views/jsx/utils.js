/**
 * Format given date
 * @param {Date} date
 * @return {String}
 */
export function formatDate(date) {
  return date.getFullYear() + '.' +
        (date.getMonth() < 10 ? '0' : '') +
        date.getMonth() + '.' +
        (date.getDate() < 10 ? '0' : '') +
        date.getDate() + '. ' +
        date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' : '') +
        date.getMinutes();
}

/**
 * Requests a URL, returns a promise
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {Promise}           The request promise
 */
export function request(url, options) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          return new Promise(() => response.json()
            .then(json => reject({
              status: response.status,
              json,
            }))
          );
        }

        return resolve(response.json());
      })
      .catch(() => reject());
  });
}
