'use strict';

angular.module('shace.resources').
    factory('Reports', ['$resource', 'Config', function ($resource, Config) {
        return $resource(Config.apiAccessPoint+'/images/:hash/report', {
            /* Default params */
            hash: '@hash'
        });
    }]);