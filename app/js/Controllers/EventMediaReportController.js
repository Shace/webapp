'use strict';

angular.module('shace.controllers').
    controller('EventMediaReportController',
    ['$scope', '$modalInstance', '$state', 'Notifications', 'Medias', 'Reports',
        function ($scope, $modalInstance, $state, Notifications, Medias, Reports) {
            $scope.type = 'illegal';

            // TODO: Use real hash
            $scope.report = function () {
                var report = new Reports();
                report.hash = 'test';
                report.$save(function (e) {
                    console.log(e);
                    $modalInstance.close();
                }, function (response) {
                    if (response.data) {
                        Notifications.notify({
                            type: 'danger',
                            message: response.data.error.type,
                            duration: 0
                        });
                    }
                });
            };
        }])
;
