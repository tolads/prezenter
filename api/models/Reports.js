/**
* Reports.js
* @description Model for storing datas from built in presentation apps
*/

module.exports = {
  attributes: {
    app: {
      type: 'string',
      required: true,
    },
    start: {
      type: 'string',
      required: true,
    },
    presentation: {
      model: 'presentations',
      required: true,
    },
    slide: {
      type: 'integer',
    },
    content: {
      type: 'json',
    },
  },

};
