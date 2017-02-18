/**
* Users.js
*
* @description :: model for storing users
*/

const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

module.exports = {
  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true,
    },
    fullname: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    memberof: {
      collection: 'Groups',
      via: 'members',
    },
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
  signup: (inputs, cb) => {
    bcrypt.hash(inputs.password, SALT_WORK_FACTOR, (err, hash) => {
      Users.create({
        username: inputs.username,
        fullname: inputs.fullname,
        password: hash,
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
  attemptLogin: (inputs, cb) => {
    // Create a user
    Users.findOne({
      username: inputs.username,
    })
    .exec((err, user) => {
      if (user && !bcrypt.compareSync(inputs.password, user.password)) {
        user = undefined;
      }
      cb(err, user);
    });
  },
};
