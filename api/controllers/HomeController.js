/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 */

module.exports = {

  /**
   * `HomeController.index()`
   */
  index: (req, res) => {
    return res.sendfile('.tmp/public/index.html');
  },
};
