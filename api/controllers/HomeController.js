/**
 * HomeController
 * @description Server-side logic for managing home
 */

module.exports = {
  /**
   * Send index.html file
   * @event GET /
   */
  index: (req, res) => res.sendfile('.tmp/public/index.html'),
};
