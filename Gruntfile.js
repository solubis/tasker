module.exports = function (grunt) {
  grunt.initConfig({

        distdir: 'app',
        libsdir: 'app/lib',

        sass: {
          options: {
            loadPath: ['app/lib/bootstrap-sass/vendor/assets/stylesheets']
          },
          dist: {
            options: {
            },
            files: {
              'app/css/app.css': 'sass/app.scss'
            }
          }
        },

        cssmin: {
          combine: {
            files: {
              'app/css/app.min.css': ['app/css/**/*.css']
            }
          }
        },

        uglify: {
          default: {
            files: {
              'app/lib.min.js': [
                '<%= libsdir %>/angular/angular.js',
                '<%= libsdir %>/angular-animate/angular-animate.js',
                '<%= libsdir %>/angular-bootstrap/ui-bootstrap.js',
                '<%= libsdir %>/angular-ui-router/release/angular-ui-router.js',
                '<%= libsdir %>/angular-toaster/toaster.js',
                '<%= libsdir %>/modernizr/modernizr.js',
                '<%= libsdir %>/fastclick/fastclick.js',
                '<%= libsdir %>/chance/chance.js',
                '<%= libsdir %>/pouchdb/dist/pouchdb-nightly.js'
              ],
              'app/bundle.min.js': ['app/bundle.js']
            }
          }
        },

        browserify: {
          app: {

            options: {
              bundleOptions: {
                debug: true
              }
            },

            src: 'app/js/app.js',
            dest: '<%= distdir %>/bundle.js'
          }

          /*libs: {
           options: {
           shim: {
           angular: { path: '<%= libsdir %>/angular/angular.js', exports: 'angular'}
           },
           alias: [
           '<%= libsdir %>/angular/angular.js:angular',
           '<%= libsdir %>/angular-animate/angular-animate.js:angular-animate',
           '<%= libsdir %>/angular-bootstrap/ui-bootstrap.js:angular-bootstrap',
           '<%= libsdir %>/angular-ui-router/release/angular-ui-router.js:angular-router',
           '<%= libsdir %>/angular-toaster/toaster.js:angular-toaster',
           '<%= libsdir %>/modernizr/modernizr.js:modernizr',
           '<%= libsdir %>/fastclick/lib/fastclick.js:fastclick',
           '<%= libsdir %>/chance/chance.js:chance',
           '<%= libsdir %>/pouchdb/dist/pouchdb-nightly.js:pouchdb'
           ]
           },
           files: {
           'app/lib.js': [
           '<%= libsdir %>/angular/angular.js',
           '<%= libsdir %>/angular-animate/angular-animate.js',
           '<%= libsdir %>/angular-bootstrap/ui-bootstrap.js',
           '<%= libsdir %>/angular-ui-router/release/angular-ui-router.js',
           '<%= libsdir %>/angular-toaster/toaster.js',
           '<%= libsdir %>/modernizr/modernizr.js',
           '<%= libsdir %>/fastclick/fastclick.js',
           '<%= libsdir %>/chance/chance.js',
           '<%= libsdir %>/pouchdb/dist/pouchdb-nightly.js'
           ]
           }
           },*/

        },

        watch: {
          grunt: {
            files: ['Gruntfile.js']
          },
          sass: {
            files: ['sass/**/*.scss'],
            tasks: ['sass']
          },
          browserify: {
            files: ['app/js/**/*.js'],
            tasks: ['browserify:app']
          }
        }

      }
  );

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('build', ['sass', 'cssmin', 'browserify:app', 'uglify']);
  grunt.registerTask('default', ['build']);

}