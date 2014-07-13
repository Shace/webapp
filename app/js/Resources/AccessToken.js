'use strict';

angular.module('shace.resources').
    factory('AccessToken', ['$resource', 'config', function ($resource, config) {
        return $resource(config.apiAccessPoint+'/access_token', {
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
                url: config.apiAccessPoint+'/access_token/:accessToken',
                method: 'PUT'
            }
        });
    }]);