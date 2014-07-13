'use strict';

angular.module('shace.resources').
    factory('Events', ['$resource', 'config', function ($resource, config) {

    return $resource(config.apiAccessPoint+'/events/:token', {
        /* Default params */
    }, {
        /* Custom actions */
        update: {method: 'PUT'},

        /*
         * Requests access to an event
         */
        access: {
            url: config.apiAccessPoint+'/events/:token/access',
            method: 'POST'
        }
    });
}]);