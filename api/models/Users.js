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
    presentations: {
      collection: 'presentations',
      via: 'owner',
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
  signup: inputs => (
    new Promise((resolve, reject) => {
      bcrypt.hash(inputs.password, SALT_WORK_FACTOR, (err, hash) => {
        Users.create({
          username: inputs.username,
          fullname: inputs.fullname,
          password: hash,
        })
          .then(resolve)
          .catch(reject);
      });
    })
  ),


  /**
   * Check validness of a login using the provided inputs.
   *
   * @param  {Object}   inputs
   *                     • username {String}
   *                     • password {String}
   * @param  {Function} cb
   */
  attemptLogin: inputs => (
    // Create a user
    new Promise((resolve, reject) => {
      Users.findOne({
        username: inputs.username,
      })
        .then((user) => {
          if (user && !bcrypt.compareSync(inputs.password, user.password)) {
            resolve();
          }
          resolve(user);
        })
        .catch(reject);
    })
  ),
};
