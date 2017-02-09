/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 */

module.exports = {

  /**
   * `UserController.login()`
   */
  login: (req, res) => {
    // See `api/responses/login.js`
    return res.login({
      username: req.param('username'),
      password: req.param('password'),
      successRedirect: '/',
      invalidRedirect: '/#login',
    });
  },


  /**
   * `UserController.logout()`
   */
  logout: (req, res) => {
    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;

    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a simple response letting the user agent know they were logged out
    // successfully.
    if (req.wantsJSON) {
      return res.ok('Logged out successfully!');
    }

    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/');
  },


  /**
   * `UserController.signup()`
   */
  signup: (req, res) => {
    let error = false;

    if (req.param('username') === '') {
      error = true;
      req.addFlash('username_error', 'Felhasználónév megadása kötelező.');
    } else if (req.param('username').length > 63) {
      error = true;
      req.addFlash('username_error', 'A felhasználónév túl hosszú.');
    } else if (!/^[a-zA-Z0-9_]+$/.test(req.param('username'))) {
      error = true;
      req.addFlash('username_error',
        'A felhasználónév csak az angol ABC kis- és nagybetűit, számokat és aláhúzásjelet tartalmazhat.');
    }

    if (req.param('password') === '') {
      error = true;
      req.addFlash('password_error', 'Jelszó megadása kötelező.');
    } else if (req.param('password2') !== req.param('password')) {
      error = true;
      req.addFlash('password2_error', 'A megadott jelszavak nem egyeznek.');
    }

    if (req.param('fullname') === '') {
      error = true;
      req.addFlash('fullname_error', 'Teljes név megadása kötelező.');
    } else if (req.param('fullname').length > 127) {
      error = true;
      req.addFlash('fullname_error', 'A név túl hosszú.');
    } else if (!/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰäÄôÔýÝčČďĎĺĹňŇšŠťŤ_ ,.\-/()]+$/
      .test(req.param('fullname'))) {
      error = true;
      req.addFlash('fullname_error', 'A név nem megengedett karaktert tartalmaz.');
    }

    if (error) {
      req.addFlash('username', req.param('username'));
      req.addFlash('fullname', req.param('fullname'));
      return res.redirect('/#signup');
    }

    Users.findOne({
      username: req.param('username'),
    }).exec((err, user) => {
      if (err) return res.negotiate(err);

      if (user !== undefined) {
        req.addFlash('username', req.param('username'));
        req.addFlash('fullname', req.param('fullname'));
        req.addFlash('username_error', 'A felhasználónév foglalt.');
        return res.redirect('/#signup');
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

        // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
        // send a 200 response letting the user agent know the signup was successful.
        if (req.wantsJSON) {
          return res.ok('Signup successful!');
        }

        // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
        return res.redirect('/');
      });
    });
  },
};
