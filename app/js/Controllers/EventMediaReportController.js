'use strict';

angular.module('shace.controllers').
    controller('EventMediaReportController',
    ['$scope', '$modalInstance', '$state', 'Notifications', 'Medias', 'Reports',
        function ($scope, $modalInstance, $state, Notifications, Medias, Reports) {
            $scope.report = {
                type: 'Spam'
            };

            $scope.submit = function () {
                var report = new Reports();
                report.hash = $scope.media.image.hash;
                report.type = $scope.report.type;
                report.$save(function () {
                    $modalInstance.close();
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
