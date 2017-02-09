/**
 * Development environment settings
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
  models: {
    // connection: 'localDiskDb'
    connection: 'herokuPostgresqlServer',
  }
};
