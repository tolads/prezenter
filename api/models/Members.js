/**
* Groups.js
*
* @description :: model for storing members of user groups
*/

module.exports = {
  attributes: {
    group: {
      model: 'Groups',
      required: true,
    },
    user: {
      model: 'User',
      required: true
    }
  },

};
