'use strict';

/* Resources */

angular.module('shace.resources', []).
    /*
     * AccessToken
     */
    factory('AccessToken', ['$resource', 'config', function ($resource, config) {
    
        var AccessToken = $resource(config.apiAccessPoint+'/access_token', {
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
                        
        return AccessToken;
    }]).
    
    /*
     * Users
     */
    factory('Users', ['$resource', 'config', function ($resource, config) {
    
        var Users = $resource(config.apiAccessPoint+'/users/:id', {
            /* Default params */
                id: '@id'
            }, {
                /* Custom actions */
                
                /*
                 * Get currently authentified user
                 */
                me: {
                    url: config.apiAccessPoint+'/users/me',
                    method: 'GET'
                },
                update: {method: 'PUT'}
            });
                        
        return Users;
    }]).
    
    /*
     * Events
     */
    factory('Events', ['$resource', 'config', function ($resource, config) {
    
        var Events = $resource(config.apiAccessPoint+'/events/:token', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'},
            
            /*
             * Requests access to an event
             */
            access: {
                url: config.apiAccessPoint+'/events/:token/access',
                method: 'POST'
            }
        });
                        
        return Events;
    }]).
    
    /*
     * Medias
     */
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
    }]).
    
    /*
     * Comments
     */
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
    }]).
    
    /*
     * Tags
     */
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
    }])
;