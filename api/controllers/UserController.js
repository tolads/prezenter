/**
 * UserController
 * @description Server-side logic for managing users
 */

module.exports = {
  /**
   * Determine if visitor is logged in
   * @event GET /isloggedin
   */
  isLoggedIn: (req, res) => {
    if (!req.session.me) {
      return res.ok({
        loggedin: false,
      });
    }

    Users.findOne({
      id: req.session.me,
    })
      .then(user => (
        res.ok({ loggedin: user ? user.username : false })
      ))
      .catch(res.negotiate);
  },

  /**
   * Log in user
   * @event POST /login
   *   {String} username
   *   {String} password
   */
  login: (req, res) => {
    const username = req.param('username');
    const password = req.param('password');

    if (!username || !password) {
      return res.badRequest({
        success: false,
        errors: 'Felhasználónév és jelszó megadása kötelező.',
      });
    }
    // See `api/responses/login.js`
    return res.login({ username, password });
  },

  /**
   * Log out user
   * @event GET /logout
   */
  logout: (req, res) => {
    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;

    return res.ok({ success: 'Sikeres kijelentkezés.' });
  },

  /**
   * Sign up user
   * @event POST /login
   *   {String} username
   *   {String} password
   *   {String} fullname
   */
  signup: (req, res) => {
    const errors = {};
    const username = req.param('username');
    const password = req.param('password');
    const fullname = req.param('fullname');
    let hasError = false;

    if (!username) {
      hasError = true;
      errors.username_error = 'Felhasználónév megadása kötelező.';
    } else if (username.length > 63) {
      hasError = true;
      errors.username_error = 'A felhasználónév túl hosszú.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      hasError = true;
      errors.username_error = 'A felhasználónév csak az angol ABC kis- és nagybetűit, számokat és aláhúzásjelet tartalmazhat.';
    }

    if (!password) {
      hasError = true;
      errors.password_error = 'Jelszó megadása kötelező.';
    }

    if (!fullname) {
      hasError = true;
      errors.fullname_error = 'Teljes név megadása kötelező.';
    } else if (fullname.length > 127) {
      hasError = true;
      errors.fullname_error = 'A név túl hosszú.';
    } else if (!/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰäÄôÔýÝčČďĎĺĹňŇšŠťŤ_ ,.\-/()]+$/
      .test(fullname)) {
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
      username,
    })
      .then((user) => {
        if (user !== undefined) {
          errors.username_error = 'A felhasználónév foglalt.';
          return res.badRequest({
            success: false,
            errors,
          });
        }

        // Attempt to signup a user using the provided parameters
        Users.signup({ username, password, fullname })
          .then((user) => {
            req.session.me = user.id;

            return res.ok({ success: 'Signup successful!' });
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },

  /**
   * List all the users
   * @event GET /list
   */
  list: (req, res) => {
    Users.find()
      .then((users) => {
        const userList = users.map(user => ({
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
        }));

        return res.ok(userList);
      })
      .catch(res.negotiate);
  },

  /**
   * Get details of current user
   * @event GET /me
   */
  me: (req, res) => {
    Users.findOne({
      id: req.session.me,
    }).populate('groups').populate('presentations')
      .then(user => (
        res.ok({
          username: user.username,
          fullname: user.fullname,
          date: user.createdAt,
          groups: user.groups.length,
          presentations: user.presentations.length,
        })
      ))
      .catch(res.negotiate);
  },

  /**
   * Delete current user
   * @event GET /delete
   */
  delete: (req, res) => {
    Users.findOne({
      id: req.session.me,
    })
      .then((user) => {
        if (user === undefined) {
          return res.badRequest({ success: false });
        }

        Users.destroy({
          id: req.session.me,
        })
          .then(() => {
            req.session.me = null;
            res.ok({ success: 'Felhasználó törölve.' })
          })
          .catch(res.negotiate);
      })
      .catch(res.negotiate);
  },
};
