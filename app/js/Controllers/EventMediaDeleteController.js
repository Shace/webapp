'use strict';

angular.module('shace.controllers').
    controller('EventMediaDeleteController',
    ['$scope', '$modalInstance', '$state', 'Notifications', 'Medias',
    function ($scope, $modalInstance, $state, Notifications, Medias) {
        $scope.delete = function () {
            Medias.remove({
                eventToken: $state.params.token,
                id: $scope.media.id
            }, function () {
                $modalInstance.close();
                $scope.exit();
                $scope.loadEvent();
            }, function (response) {
                if (response.data) {
                    Notifications.notify({
                        type: 'danger',
                        message: response.data.error.type,
                        duration: 3
                    });
                }
            });
        };
    }])
;
