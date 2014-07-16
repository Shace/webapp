'use strict';

angular.module('shace.resources').
    factory('Medias', ['$resource', 'Config', function ($resource, Config) {

        var Medias = $resource(Config.apiAccessPoint+'/events/:eventToken/medias/:id', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'}
        });

        Medias.getUploadUrl = function (media) {
            return Config.apiAccessPoint+'/events/'+media.event+'/medias/'+media.id;
        };

        return Medias;
    }]);