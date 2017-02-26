/**
 * res.login([inputs])
 * @param {String} inputs.username
 * @param {String} inputs.password
 * @description Log the requesting user in using a passport strategy
 */

module.exports = function login(inputs = {}) {
  // Get access to `req` and `res`
  const req = this.req;
  const res = this.res;

  // Look up the user
  Users.attemptLogin({
    username: inputs.username,
    password: inputs.password,
  })
    .then((user) => {
      if (!user) {
        return res.badRequest({
          success: false,
          errors: 'Hibás felhasználónév vagy jelszó.',
        });
      }

      req.session.me = user.id;

      return res.ok({ loggedin: inputs.username });
    })
    .catch(res.negotiate);
};
