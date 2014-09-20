'use strict';

/* Resources */

angular.module('shace.resources').
    factory('Users', ['$resource', 'Config', function ($resource, Config) {

        var Users = $resource(Config.apiAccessPoint+'/users/:id', {
            /* Default params */
            id: '@id'
        }, {
            update: {method: 'PUT'},

            /* Custom actions */

            /*
             * Get currently authenticated user
             */
            me: {
                url: Config.apiAccessPoint+'/users/me',
                method: 'GET'
            },

            /*
             * Get current user events
             */
            myEvents: {
                url: Config.apiAccessPoint+'/users/me/events',
                method: 'GET'
            }
        });

        Users.getPictureUploadURL = function (user) {
            return Config.apiAccessPoint+'/users/'+user.id+'/profile';
        };

        return Users;
    }]);