module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      options: {
        //paths: [ 'public/css/gekijou' ]
      },
      dev: {
        files: {
          'public/css/chat/build/bubble.css': 'public/css/chat/src/bubble.less',
          'public/css/gekijou/build/editor.css': 'public/css/gekijou/src/editor.less',
          'public/css/gekijou/build/gekijou.css': 'public/css/gekijou/src/gekijou.less',
        }
      }
    },
    coffee: {
      options: {
        bare: true
      },
      compile: {
        files: {
          'public/js/chat/build/bubble.js': 'public/js/chat/src/bubble.coffee',
          'public/js/gekijou/build/util.js': 'public/js/gekijou/src/util.coffee',
          'public/js/gekijou/build/chara.js': 'public/js/gekijou/src/chara.coffee',
          'public/js/gekijou/build/album.js': 'public/js/gekijou/src/album.coffee',
          'public/js/gekijou/build/editor.js': 'public/js/gekijou/src/editor.coffee',
          'public/js/gekijou/build/gekijou.js': 'public/js/gekijou/src/gekijou.coffee',
          'public/js/gekijou/build/event.js': 'public/js/gekijou/src/event.coffee',
        }
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> by tengattack */\n'
      },
      compress: {
        files: {
          'public/css/chat/bubble.min.css': [
            "public/css/chat/build/bubble.css"
          ],
          'public/css/gekijou/editor.min.css': [
            "public/css/gekijou/build/editor.css"
          ],
          'public/css/gekijou/gekijou.min.css': [
            "public/css/gekijou/build/gekijou.css"
          ]
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> by tengattack */\n'
      },
      release: {
        options: {
          mangle: true,
          report: 'min',
        },
        files: {
          'public/js/chat/bubble.min.js': [
            "public/js/chat/build/bubble.js"
          ],
          'public/js/gekijou/editor.min.js': [
            "public/js/gekijou/build/editor.js"
          ],
          'public/js/gekijou/gekijou.min.js': [
            "public/js/gekijou/build/util.js",
            "public/js/gekijou/build/chara.js",
            "public/js/gekijou/build/album.js",
            "public/js/gekijou/build/event.js",
            "public/js/gekijou/build/gekijou.js",
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['less', 'coffee', 'cssmin', 'uglify']);
  grunt.registerTask('js', ['coffee']);
  grunt.registerTask('css', ['less']);

  /*
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-css');

  grunt.registerTask('default', ['concat', 'uglify', 'concat_css', 'cssmin']);
  grunt.registerTask('js', ['concat', 'uglify']);
  grunt.registerTask('css', ['concat_css', 'cssmin']);
  */
};
