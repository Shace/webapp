'use strict';

angular.module('shace.resources').
    factory('BetaInvitations', ['$resource', 'Config', function ($resource, Config) {
    var BetaInvitations = $resource(Config.apiAccessPoint+'/beta/invitations', {
        /* Default params */
    }, {

    });

    return BetaInvitations;
}]);