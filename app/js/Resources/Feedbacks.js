'use strict';

angular.module('shace.resources').
    factory('Feedbacks', ['$resource', 'Config', function ($resource, Config) {
        var Feedbacks = $resource(Config.apiAccessPoint+'/feedback', {
            /* Default params */
        }, {
        });

        return Feedbacks;
    }]);