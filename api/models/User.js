/**
* User.js
*
* @description :: model for storing users
*/

var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

module.exports = {
  tableName: 'users',

  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    fullname: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },


  /**
   * Create a new user using the provided inputs.
   *
   * @param  {Object}   inputs
   *                     • username {String}
   *                     • fullname {String}
   *                     • password {String}
   * @param  {Function} cb
   */
  signup: function (inputs, cb) {
    bcrypt.hash(inputs.password, SALT_WORK_FACTOR, function(err, hash) {
      User.create({
        username: inputs.username,
        fullname: inputs.fullname,
        password: hash
      })
      .exec(cb);
    });
  },


  /**
   * Check validness of a login using the provided inputs.
   *
   * @param  {Object}   inputs
   *                     • username {String}
   *                     • password {String}
   * @param  {Function} cb
   */
  attemptLogin: function (inputs, cb) {
    // Create a user
    User.findOne({
      username: inputs.username
    })
    .exec(function (err, user) {
      if (user && !bcrypt.compareSync(inputs.password, user.password)) {
        user = undefined;
      }
      cb(err, user);
    });
  }
};
