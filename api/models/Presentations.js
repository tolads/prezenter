/**
* Presentations.js
* @description Model for storing presentations
*/

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      size: 128,
    },
    desc: {
      type: 'string',
    },
    owner: {
      model: 'Users',
      required: true,
    },
    content: {
      type: 'json',
    },
    reports: {
      collection: 'Reports',
      via: 'presentation',
    },
  },

  /**
   * Called after destroying Presentation records, delete their stuff also
   * @param  {Object[]} deletedRecords
   * @param  {Function} cb - callback function
   */
  afterDestroy: (deletedRecords, cb) => {
    const deleteReports = deletedRecords.map(presentation => (
      new Promise((resolve, reject) => {
        Reports.destroy({
          presentation: presentation.id,
        })
          .then(resolve)
          .catch(reject);
      })
    ));

    Promise.all(deleteReports)
      .then(() => cb())
      .catch(() => cb());
  },

};
