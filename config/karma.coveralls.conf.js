'use strict';

module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'app/bower_components/angular/angular.js',
            //'app/bower_components/angular-*/angular-*.js',
            'test/lib/angular/angular-mocks.js',
            '.tmp/scripts/combined-scripts.js',
            'test/unit/**/*.js',
            'test/e2e/**/*.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        reporters: ['coverage'],
        preprocessors: {
            'app/js/*': ['coverage']
        },

        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
