/**
* Groups.js
* @description Model for storing user groups
*/

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    owner: {
      model: 'Users',
      required: true,
    },
    members: {
      collection: 'Users',
      via: 'memberof',
      dominant: true,
    },
  },

};
