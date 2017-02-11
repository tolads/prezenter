/**
 * Run Browserify and Reactify.
 *
 * ---------------------------------------------------------------
 *
 */
module.exports = function(grunt) {

  grunt.config.set('browserify', {
    options: {
      transform: [['babelify', { presets: ['es2015', 'react'] }]],
      browserifyOptions: {
        extensions: [".jsx"],
      }
    },
    client: {
      src: ['views/jsx/**/*.jsx'],
      dest: '.tmp/public/js/bundle.js'
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
