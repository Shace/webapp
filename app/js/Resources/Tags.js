'use strict';

angular.module('shace.resources').
    factory('Tags', ['$resource', 'Config', function ($resource, Config) {

        var Tags = $resource(Config.apiAccessPoint+'/events/:eventToken/medias/:mediaId/tags/:id', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'}
        });
        
        Tags.getUploadUrl = function (tag) {
            return Config.apiAccessPoint+'/events/'+tag.media.event+'/medias/'+tag.media.id+'/tags/'+tag.id;
        };

        return Tags;
    }]);