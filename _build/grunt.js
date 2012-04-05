/**
 * grunt
 * This compiles coffee to js
 *
 * grunt: https://github.com/cowboy/grunt
 */
module.exports = function(grunt){

  grunt.initConfig({
    pkg: '<json:info.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        ' <%= grunt.template.today("m/d/yyyy") %>\n' +
        ' <%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      '../jquery.tinyscroller.js': [ '<banner>', '../jquery.tinyscroller.js' ]
    },
    watch: {
      files: [
        '../jquery.tinyscroller.coffee',
        '../tests/qunit/test/test.coffee'
      ],
      tasks: 'coffee concat notifyOK'
    },
    uglify: {
      '../jquery.tinyscroller.min.js': '../jquery.tinyscroller.js'
    },
    coffee: {
      '../jquery.tinyscroller.js': [ '../jquery.tinyscroller.coffee' ],
      '../tests/qunit/test/test.js' : [ '../tests/qunit/test/test.coffee' ]
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', 'coffee concat notifyOK');

};
