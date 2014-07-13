'use strict';

angular.module('shace.resources').
    factory('Tags', ['$resource', 'config', function ($resource, config) {

        var Tags = $resource(config.apiAccessPoint+'/events/:eventToken/medias/:mediaId/tags/:id', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'}
        });
        
        Tags.getUploadUrl = function (tag) {
            return config.apiAccessPoint+'/events/'+tag.media.event+'/medias/'+tag.media.id+'/tags/'+tag.id;
        };

        return Tags;
    }]);