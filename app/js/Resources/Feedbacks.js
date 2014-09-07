'use strict';

angular.module('shace.resources').
    factory('Feedbacks', ['$resource', 'Config', function ($resource, Config) {
        var Feedbacks = $resource(Config.apiAccessPoint+'/feedback', {
            /* Default params */
        }, {
            list: {
                url: Config.apiAccessPoint+'/feedback/administration',
                method: 'GET'
            },

            process: {
                url: Config.apiAccessPoint+'/feedback/administration',
                method: 'PUT'
            }
        });

        return Feedbacks;
    }]);