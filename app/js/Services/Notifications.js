'use strict';

angular.module('shace.services').
    factory('Notifications',
    ['$timeout', '$location', 'Shace', function ($timeout, $location, Shace) {

        var Notifications = {
            notifier: undefined
        };

        /*
         * Registers a notifier object to present notifications
         */
        Notifications.registerNotifier = function (notifier) {
            Notifications.notifier = notifier;
        };

        /*
         * Present a given notification
         * using the registered notifier
         */
        Notifications.notify = function (notification) {
            // Report creation of the notification to ensure
            // notifier has already been registered
            $timeout(function() {
                if (!Notifications.notifier) {
                    // TODO: Queue notifications until a notifier become available ?
                    return;
                }
                Notifications.notifier.notify(notification);
            });
        };

        /*
         * Helper function to notify an error
         */
        Notifications.notifyError = function (message, duration) {
            Notifications.notify({
                type: 'danger',
                message: message,
                duration: duration
            });
            if (message.error && message.error.code == 207) {
                Notifications.redirection = $location.path();
                console.log(Notifications);
                $location.path('/login');
            }
            if (message.error && message.error.code == 200) {
                Shace.logout();
            }
        };

        /*
         * Helper function to notify a success
         */
        Notifications.notifySuccess = function (message, duration) {
            Notifications.notify({
                type: 'success',
                message: message,
                duration: duration
            });
        };

        return Notifications;
    }])