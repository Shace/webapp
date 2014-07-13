'use strict';

angular.module('shace.controllers').
    controller('NotificationsController', ['$scope', '$timeout', 'Notifications', function ($scope, $timeout, Notifications) {
        $scope.notifications = [];

        $scope.closeNotification = function (notification) {
            var i, l;

            if (angular.isNumber(notification)) {
                $scope.notifications.splice(notification, 1);
            } else {
                for (i = 0, l = $scope.notifications.length; i < l; i += 1) {
                    if ($scope.notifications[i] === notification) {
                        $scope.notifications.splice(i, 1);
                        return;
                    }
                }
            }
        };

        Notifications.registerNotifier({
            notify: function (notification) {
                var
                    duration = angular.isDefined(notification.duration) ? notification.duration : 5
                    ;

                $scope.notifications.push(notification);
                if (duration > 0) {
                    $timeout(function () {
                        $scope.closeNotification(notification);
                    }, duration*1000);
                }
            }
        });
    }]);