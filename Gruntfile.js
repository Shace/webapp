'use strict';

var project = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
};

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        project: project,

        watch: {
            neuter: {
                files: ['<%= project.app %>/js/**/*.js'],
                tasks: ['neuter']
            },
            less: {
                files: ['<%= project.app %>/less/**/*.less'],
                tasks: ['less:dist']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            }
        },

        replace: {
            default: {
                src: ['<%= project.dist %>/js/**/*.js'],
                overwrite: true,
                replacements: [{
                    from: 'localhost:9000',
                    to: grunt.option('api') || 'api.shace.io'
                }]
            }
        },

        neuter: {
            app: {
                options: {
                    filepathTransform: function (filepath) {
                        return project.app + '/' + filepath;
                    }
                },
                src: '<%= project.app %>/js/app.js',
                dest: '.tmp/js/combined-scripts.js'
            }
        },

        coveralls: {
            options: {
                debug: true,
                coverage_dir: 'coverage',
                force: true
            }
        },

        connect: {
            options: {
                port: 8000,
                hostname: '*'
            },
            dev: {
                options: {
                    base:  ['.tmp', '<%= project.app %>']
                }
            },
            test: {
                options: {
                    port: 8001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= project.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= project.dist %>'
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= project.app %>/js/**/*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/**/*.js']
            }
        },

        less: {
            dist: {
                options: {
                    path: '<%= project.app %>/less/**/*.less',
                    compile: true,
                    cleancss: true
                },

                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/less',
                    src: '**/*.less',
                    dest: '.tmp/styles/',
                    ext: '.css'
                }]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= project.dist %>/*',
                        '!<%= project.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        wiredep: {
            target: {
                src: ['<%= project.app %>/*.html', '<%= project.app %>/partials/**/*.html']
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= project.dist %>/js/**/*.js',
                        '<%= project.dist %>/styles/**/*.css',
                        '<%= project.dist %>/img/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= project.dist %>/styles/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= project.app %>/*.html', '<%= project.app %>/partials/**/*.html'],
            //html: ['<%= project.app %>/**/*.html'],
            options: {
                dest: '<%= project.dist %>'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= project.dist %>/*.html', '<%= project.dist %>/partials/**/*.html'],
            css: ['<%= project.dist %>/styles/**/*.css'],
            options: {
                assetsDirs: ['<%= project.dist %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/img',
                    src: '**/*.{png,jpg,jpeg,gif}',
                    dest: '<%= project.dist %>/img'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/img',
                    src: '**/*.svg',
                    dest: '<%= project.dist %>/img'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.dist %>',
                    src: ['*.html', 'partials/**/*.html'],
                    dest: '<%= project.dist %>'
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'partials/**/*.html',
                        'languages/*.json',
                        'bower_components/**/*',
                        'img/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/img',
                    dest: '<%= project.dist %>/img',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= project.app %>/less',
                dest: '.tmp/styles/',
                src: '**/*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less'
            ],
            test: [
                'less'
            ],
            dist: [
                'less',
                'imagemin',
                'svgmin'
            ]
        },

        karma: {
            default: {
                configFile: 'config/karma.conf.js',
                singleRun: true
            },
            travis: {
                configFile: 'config/karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            },
            coverall: {
                configFile: 'config/karma.coveralls.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer',
            'neuter:app',
            'connect:dev',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'neuter:app',
        'connect:test',
        'karma:default'
    ]);

    grunt.registerTask('testTravis', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'neuter:app',
        'connect:test',
        'karma:travis'
    ]);

    grunt.registerTask('cover', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'neuter:app',
        'karma:coverall'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'neuter:app',
        'autoprefixer',
        'concat',
        'copy:dist',
        'cssmin',
        'uglify',
        'rev',
        'usemin',
        'replace',
        'htmlmin'
    ]);

    grunt.registerTask('heroku:production', [
        'build'
    ]);

    grunt.registerTask('travis', [
        //'newer:jshint',
        'testTravis',
        'karma:coverall',
        'build'
    ]);

    grunt.registerTask('default', [
        //'newer:jshint',
        'test',
        'build'
    ]);
};
