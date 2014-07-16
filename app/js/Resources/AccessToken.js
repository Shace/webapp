'use strict';

angular.module('shace.resources').
    factory('AccessToken', ['$resource', 'Config', function ($resource, Config) {
        return $resource(Config.apiAccessPoint+'/access_token', {
            /* Default params */
        }, {
            /* Custom actions */

            /*
             * Requests a new access token
             */
            request: { method: 'POST' },

            /*
             * Update an existing access token
             */
            update: {
                url: Config.apiAccessPoint+'/access_token/:accessToken',
                method: 'PUT'
            }
        });
    }]);