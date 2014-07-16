'use strict';

/* Resources */

angular.module('shace.resources').
    factory('Users', ['$resource', 'Config', function ($resource, Config) {

        return $resource(Config.apiAccessPoint+'/users/:id', {
            /* Default params */
            id: '@id'
        }, {
            /* Custom actions */

            /*
             * Get currently authentified user
             */
            me: {
                url: Config.apiAccessPoint+'/users/me',
                method: 'GET'
            },
            update: {method: 'PUT'}
        });
    }]);