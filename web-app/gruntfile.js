/// <vs />
// Gruntfile.js
module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    
    grunt.initConfig({

        
        jshint: {
            pub: 'public/js/**/*.js',
            server: ['server.js', 'app/**/*.js']
        },

        uglify: {
            generated: {
                files: [{
                expand: true,
                src: 'public/js/**/*.js',
                dest: 'build/public/js/min',
                ext : '.min.js',
                }]
            },
            backend: {
                options:
                {
                    mangle: false
                },
                files: [
                    { 
                        expand: true,
                        src: [
                            'server.js',
                            'app/**/*.js'
                        ],
                        dest: 'build/' 
                    }
                ]

            }
        },

        concat: {
            generated: {
                files:{
                    'build/public/js/bower.js': ['public/lib/**/*.min.js'],
                    'build/public/js/app.js': ['public/js/min/**/*.js']
                }
            }
        },

        cssmin: {
            generated: {
                files: {
                    'build/public/css/style.min.css': ['public/css/styles.css']
                }
            }
        },

        copy: {
            main: {
                files: [
                    { 
                        expand: true, src: [
                            'package.json',
                            'common.js',
                            'env.json',
                            'Procfile',
                            'public/fonts'
                        ],
                        dest: 'build/' 
                    }
                ]
            },

            server: {
                expand: true,
                src: 'server.js',
                dest: 'build/'
            },

            html: {
                expand: true,
                src: 'public/views/**/*.html',
                dest: 'build/'
            },

            index: {
                expand: true,
                src: 'public/index.html',
                dest: 'build'
            }
        },

        csslint: {
        	strict: {
        		options: {
        			import: 2
        		},
        		src: 'public/css/styles.css'
        	}
        },

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},

				files: [{
					expand: true,
					src: 'public/views/**/*.html',
					dest: 'build/'
				}]
			}
		},

        watch: {
            all: {
                files: ['public/fonts/**', 'public/img/**', 'public/lib/**', 'public/views/**', 'public/templates/**', 'public/modals/**'],
                options: {
                    livereload: 35729
                }
            },

            server:{
                files: ['server.js', 'app/**/*.js'],
                tasks: 'jshint:server'
            },

            js: {
                files: 'public/js/**',
                tasks: 'jshint:pub',
                options: {
                    livereload: 35729
                }
            },

            css: {
                files: 'public/css/**',
                tasks: 'csslint',
                options: {
                    livereload: 35729
                }
            }
        },

        image: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'public/img/', 
                    src: ['**/*.{png,jpg,gif,svg}'],
                    dest: 'build/public/img/'
                }]
            }
        },

		clean: {
			build: ['build/*', '!build/.git'],
            min: 'build/public/js/min'
		},

        useminPrepare: {
            html: 'public/index.html',
            options: {
                dest: 'build/public'
            }
        },

        usemin: {
            html: 'build/public/index.html',
        },

        filerev: {
            images: {
                src: ['build/public/js/app.js', 'build/public/js/bower.js'],
            }
        },

        bowerInstall: {
            target: {

            // Point to the files that should be updated when 
            // you run `grunt bower-install` 
            src: ['public/index.html'],

            // Optional: 
            // --------- 
            cwd: '',
            dependencies: true,
            devDependencies: false,
            exclude: [],
            fileTypes: {},
            ignorePath: '',
            overrides: {}
            }
        },

        concurrent: {
            run: ['shell', 'watch']
        },

        shell: {
            server: {
                command: 'node server NODE_ENV=dev'
            }
        }




    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });
    
    grunt.registerTask('build', [
        'jshint',
         'csslint',
         'clean:build',
         'useminPrepare',
         'uglify:generated',
         'concat:generated',
         'cssmin',
         'copy',
         'filerev',
         'usemin',
         'clean:min',
         'uglify:backend',
         'image'
         ]);
    grunt.registerTask('default', ['watch']);

};
