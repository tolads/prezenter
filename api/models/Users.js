/**
 * Users.js
 * @description Model for storing users
 */

const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

module.exports = {
  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true,
      size: 64,
    },
    fullname: {
      type: 'string',
      required: true,
      size: 128,
    },
    password: {
      type: 'string',
      required: true,
    },
    groups: {
      collection: 'Groups',
      via: 'owner',
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
   * Called after destroying User records, delete their stuff also
   * @param  {Object[]} deletedRecords
   * @param  {Function} cb - callback function
   */
  afterDestroy: (deletedRecords, cb) => {
    const deleteGroups = deletedRecords.map(user => (
      new Promise((resolve, reject) => {
        Groups.destroy({
          owner: user.id,
        })
          .then(resolve)
          .catch(reject);
      })
    ));

    const deletePresentations = deletedRecords.map(user => (
      new Promise((resolve, reject) => {
        Presentations.destroy({
          owner: user.id,
        })
          .then(resolve)
          .catch(reject);
      })
    ));

    Promise.all([...deleteGroups, ...deletePresentations])
      .then(() => cb())
      .catch(() => cb());
  },

  /**
   * Create a new user using the provided inputs.
   * @param  {Object}   inputs
   *   {String} username
   *   {String} fullname
   *   {String} password
   * @returns {Promise<Object>}
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
   * @param  {Object}   inputs
   *   {String} username
   *   {String} password
   * @returns {Promise<Object>}
   */
  attemptLogin: inputs => (
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
