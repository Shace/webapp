'use strict';

angular.module('shace.resources').
    factory('Comments', ['$resource', 'Config', function ($resource, Config) {
    var Comments = $resource(Config.apiAccessPoint+'/events/:eventToken/medias/:mediaId/comments/:id', {
        /* Default params */
    }, {
        /* Custom actions */
        update: {method: 'PUT'}
    });

    Comments.getUploadUrl = function (comment) {
        return Config.apiAccessPoint+'/events/'+comment.media.event+'/medias/'+comment.media.id+'/comments/'+comment.id;
    };

    return Comments;
}]);