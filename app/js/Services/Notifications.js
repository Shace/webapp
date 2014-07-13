'use strict';

angular.module('shace.services').
    factory('Notifications',
    ['$timeout', function ($timeout) {

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