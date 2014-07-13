'use strict';

angular.module('shace.resources').
    factory('Comments', ['$resource', 'config', function ($resource, config) {
    var Comments = $resource(config.apiAccessPoint+'/events/:eventToken/medias/:mediaId/comments/:id', {
        /* Default params */
    }, {
        /* Custom actions */
        update: {method: 'PUT'}
    });

    Comments.getUploadUrl = function (comment) {
        return config.apiAccessPoint+'/events/'+comment.media.event+'/medias/'+comment.media.id+'/comments/'+comment.id;
    };

    return Comments;
}]);