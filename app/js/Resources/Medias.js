'use strict';

angular.module('shace.resources').
    factory('Medias', ['$resource', 'config', function ($resource, config) {

        var Medias = $resource(config.apiAccessPoint+'/events/:eventToken/medias/:id', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'}
        });

        Medias.getUploadUrl = function (media) {
            return config.apiAccessPoint+'/events/'+media.event+'/medias/'+media.id;
        };

        return Medias;
    }]);