module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    jshint: {
      files: ['server.js', 'controllers/**/*.js', 'models/**/*.js', 'common.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    concurrent: {
      lint: ['jshint', 'copy'],
      ugly: ['uglify']
    },

    uglify: {
      all: {
        options: {
          mangle: false
        },

        files: [{
          expand: true,
          src: '<%= jshint.files %>',
          dest: 'build/'
        }]
      }
    },

    copy: {
      all: {
        files: [{
          expand: true,
          src: ['env.json', 'package.json', 'Procfile', '.gitignore'],
          dest: 'build/'
        }]
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'shell:runServer']
    }

    //end grunt
  });

  grunt.registerTask('build', ['concurrent']);

};