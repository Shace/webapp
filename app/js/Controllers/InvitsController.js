'use strict';

angular.module('shace.controllers').
    controller('InvitsController', ['$scope', '$location', '$timeout', '$q', 'Notifications', 'Shace', 'BetaInvitations', 
                function ($scope, $location, $timeout, $q, Notifications, Shace, BetaInvitations) {

        $scope.loadInvits = function () {
            var deferred = $q.defer();
            
            $scope.betaInvitations = BetaInvitations.get({}, function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            
            return deferred.promise;
        };
        
        $scope.addBeta = function() {
            var email = $scope.email;
            
            if (email) {
                BetaInvitations.save({}, {
                    guests: [{email : email}]
                }, function (response) {
                    console.log(response);
                    console.log($scope.betaInvitations.invited);
                    console.log(response.invited);
                    $scope.betaInvitations.invited = $scope.betaInvitations.invited.concat(response.invited);
                    console.log($scope.betaInvitations.invited);
                    $scope.betaInvitations.remaining = response.remaining;
                    $scope.email = '';
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        $scope.loadInvits().then(function () {
        
        });

    }]);