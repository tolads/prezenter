/**
* Presentations.js
* @description Model for storing presentations
*/

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    desc: {
      type: 'string',
    },
    owner: {
      model: 'users',
      required: true,
    },
    content: {
      type: 'json',
    },
    reports: {
      collection: 'reports',
      via: 'presentation',
    },
  },

};
