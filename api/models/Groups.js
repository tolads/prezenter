/**
* Groups.js
*
* @description :: model for storing user groups
*/

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    owner: {
      model: 'User',
      required: true
    }
  },

};
