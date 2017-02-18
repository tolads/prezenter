/**
 * res.login([inputs])
 *
 * @param {String} inputs.username
 * @param {String} inputs.password
 *
 * @description :: Log the requesting user in using a passport strategy
 */

module.exports = function login(inputs) {
  inputs = inputs || {};

  // Get access to `req` and `res`
  const req = this.req;
  const res = this.res;

  // Look up the user
  Users.attemptLogin({
    username: inputs.username,
    password: inputs.password,
  }, (err, user) => {
    if (err) return res.negotiate(err);
    if (!user) {
      return res.badRequest({
        success: false,
        errors: 'Hibás felhasználónév vagy jelszó.',
      });
    }
    // "Remember" the user in the session
    // Subsequent requests from this user agent will have `req.session.me` set.
    req.session.me = user.id;

    return res.ok();
  });
};
