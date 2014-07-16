'use strict';

angular.module('shace.controllers').
    controller('BetaAdminController', ['$scope', '$state', '$timeout', '$q', 'Notifications', 'Shace', 'BetaInvitations', 
                function ($scope, $state, $timeout, $q, Notifications, Shace, BetaInvitations) {
        if (!Shace.user || !Shace.user.is_admin) {
            $state.go('home');
        }
        
        $scope.invitations = BetaInvitations.pending();
        
        $scope.acceptInvit = function (invit) {
            BetaInvitations.accept({}, {
                validated: [invit]
            }, function () {
                $scope.invitations = BetaInvitations.pending();
            });
        };
    }]);