/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 */

module.exports = {

  /**
   * `HomeController.index()`
   */
  index: function (req, res) {
    if (req.session.me) {
      return res.view('index_user', {
        loggedin: true,
        current_page: 'index'
      });
    }
    return res.view('homepage');
  },

  /**
   * `HomeController.users()`
   */
  users: function (req, res) {
    return res.view('users', {
      loggedin: true,
      current_page: 'users'
    });
  }
};
