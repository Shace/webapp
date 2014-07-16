'use strict';

angular.module('shace.resources').
    factory('BetaInvitations', ['$resource', 'Config', function ($resource, Config) {
    var BetaInvitations = $resource(Config.apiAccessPoint+'/beta/invitations', {
        /* Default params */
    }, {
        pending: {
            url: Config.apiAccessPoint+'/beta/administration',
            method: 'GET'
        },
        
        accept: {
            url: Config.apiAccessPoint+'/beta/administration',
            method: 'PUT'
        }
    });

    return BetaInvitations;
}]);