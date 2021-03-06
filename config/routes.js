/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  'GET /users/isloggedin': 'UserController.isLoggedIn',
  'GET /users/me':         'UserController.me',
  'GET /users/logout':     'UserController.logout',
  'GET /users/list':       'UserController.list',
  'POST /users/login':     'UserController.login',
  'POST /users/signup':    'UserController.signup',
  'DELETE /users/me':      'UserController.delete',

  'GET /groups/list':                      'GroupController.list',
  'POST /groups/new':                      'GroupController.new',
  'POST /groups/add':                      'GroupController.add',
  'POST /groups/rename':                   'GroupController.rename',
  'DELETE /groups/group/:id':              'GroupController.deleteGroup',
  'DELETE /groups/group/:gid/member/:uid': 'GroupController.deleteMember',

  'GET /presentations/list':              'PresentationController.list',
  'GET /presentations/get/:id':           'PresentationController.get',
  'GET /presentations/getslide/:pid/:id': 'PresentationController.getSlide',
  'GET /presentations/connect/:pid/:gid': 'PresentationController.connect',
  'GET /presentations/listactive':        'PresentationController.listActive',
  'POST /presentations/new':              'PresentationController.new',
  'POST /presentations/edit/:id':         'PresentationController.edit',
  'POST /presentations/app/:pid/:name':   'PresentationController.app',
  'DELETE /presentations/:id':            'PresentationController.delete',

  'GET /*': {
    controller: 'HomeController',
    action: 'index',
    skipAssets: true,
  },
};
