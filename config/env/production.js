/**
 * Production environment settings
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    // connection: 'localDiskDb'
    connection: 'herokuPostgresqlServer'
  }
};
