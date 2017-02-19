/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 */

module.exports = {

  /**
   * `UserController.isLoggedId()`
   */
  isLoggedIn: (req, res) => {
    if (!req.session.me) {
      return res.ok({
        loggedin: false,
      });
    }

    Users.findOne({
      id: req.session.me,
    }).exec((err, user) => {
      if (err) return res.negotiate(err);

      if (user === undefined) {
        return res.ok({
          loggedin: false,
        });
      }

      return res.ok({
        loggedin: user.username,
      });
    });
  },

  /**
   * `UserController.login()`
   */
  login: (req, res) => {
    if (!req.param('username') || !req.param('password')) {
      return res.badRequest({
        success: false,
        errors: 'Felhasználónév és jelszó megadása kötelező.',
      });
    }
    // See `api/responses/login.js`
    return res.login({
      username: req.param('username'),
      password: req.param('password'),
    });
  },


  /**
   * `UserController.logout()`
   */
  logout: (req, res) => {
    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;

    // send a simple response letting the user agent know they were logged out
    // successfully.
    return res.ok('Sikeres kijelentkezés.');
  },


  /**
   * `UserController.signup()`
   */
  signup: (req, res) => {
    let hasError = false;
    const errors = {};

    if (!req.param('username')) {
      hasError = true;
      errors.username_error = 'Felhasználónév megadása kötelező.';
    } else if (req.param('username').length > 63) {
      hasError = true;
      errors.username_error = 'A felhasználónév túl hosszú.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(req.param('username'))) {
      hasError = true;
      errors.username_error = 'A felhasználónév csak az angol ABC kis- és nagybetűit, számokat és aláhúzásjelet tartalmazhat.';
    }

    if (!req.param('password')) {
      hasError = true;
      errors.password_error = 'Jelszó megadása kötelező.';
    } else if (req.param('password2') !== req.param('password')) {
      hasError = true;
      errors.password2_error = 'A megadott jelszavak nem egyeznek.';
    }

    if (!req.param('fullname')) {
      hasError = true;
      errors.fullname_error = 'Teljes név megadása kötelező.';
    } else if (req.param('fullname').length > 127) {
      hasError = true;
      errors.fullname_error = 'A név túl hosszú.';
    } else if (!/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰäÄôÔýÝčČďĎĺĹňŇšŠťŤ_ ,.\-/()]+$/
      .test(req.param('fullname'))) {
      hasError = true;
      errors.fullname_error = 'A név nem megengedett karaktert tartalmaz.';
    }

    if (hasError) {
      return res.badRequest({
        success: false,
        errors,
      });
    }

    Users.findOne({
      username: req.param('username'),
    }).exec((err, user) => {
      if (err) return res.negotiate(err);

      if (user !== undefined) {
        errors.username_error = 'A felhasználónév foglalt.';
        return res.badRequest({
          success: false,
          errors,
        });
      }

      // Attempt to signup a user using the provided parameters
      Users.signup({
        username: req.param('username'),
        password: req.param('password'),
        fullname: req.param('fullname'),
      }, (err, user) => {
        // res.negotiate() will determine if this is a validation error
        // or some kind of unexpected server error, then call `res.badRequest()`
        // or `res.serverError()` accordingly.
        if (err) return res.negotiate(err);

        // Go ahead and log this user in as well.
        // We do this by "remembering" the user in the session.
        // Subsequent requests from this user agent will have `req.session.me` set.
        req.session.me = user.id;

        return res.ok('Signup successful!');
      });
    });
  },

  /**
   * `UserController.list()`
   */
  list: (req, res) => {
    Users.find({}).exec((err, users) => {
      if (err) return res.negotiate(err);

      const userList = [];
      users.forEach((user) => {
        userList.push({
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
        });
      });

      return res.ok(userList);
    });
  },

  /**
   * `UserController.me()`
   */
  me: (req, res) => {
    Users.findOne({
      id: req.session.me,
    }).exec((err, user) => {
      if (err) return res.negotiate(err);
console.log(user);
      return res.ok({
        username: user.username,
        fullname: user.fullname,
        date: user.createdAt,
      });
    });
  },
};
