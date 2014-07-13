'use strict';

/* Resources */

angular.module('shace.resources').
    factory('Users', ['$resource', 'config', function ($resource, config) {

        return $resource(config.apiAccessPoint+'/users/:id', {
            /* Default params */
            id: '@id'
        }, {
            /* Custom actions */

            /*
             * Get currently authentified user
             */
            me: {
                url: config.apiAccessPoint+'/users/me',
                method: 'GET'
            },
            update: {method: 'PUT'}
        });
    }]);