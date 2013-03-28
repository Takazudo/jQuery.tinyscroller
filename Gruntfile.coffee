module.exports = (grunt) ->

  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:
      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:
      mylib:
        src: [ 'jquery.tinyscroller.coffee' ]
        dest: 'jquery.tinyscroller.js'
      test:
        src: [ 'tests/qunit/test/test.coffee' ]
        dest: 'tests/qunit/test/test.js'

    concat:
      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.mylib.dest %>' ]
        dest: '<%= coffee.mylib.dest %>'

    uglify:
      options:
        banner: '<%= banner %>'
      mylib:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.tinyscroller.min.js'

    watch:
      mylib:
        files: '<%= coffee.mylib.src %>'
        tasks: [
          'default'
        ]
      test:
        files: '<%= coffee.test.src %>'
        tasks: [
          'coffee:test growl'
        ]

  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
    'growl'
  ]

