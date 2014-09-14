'use strict';

angular.module('shace.services').
    factory('Notifications',
    ['$timeout', '$state', 'Shace', function ($timeout, $state, Shace) {

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
            // Postpone creation of the notification to ensure
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
            
            if (message.error && message.error.code == 207) {
                Notifications.redirection = {state:$state.$current, params: $state.params};
                $state.go('login');
            }
            if (message.error && (message.error.code == 200 || message.error && message.error.code == 202)) {
                Shace.logout();
            }
            if (message.error && message.error.code == 412) {
                $state.go('home');
                Notifications.notify({
                    type: 'danger',
                    message: message.error.type,
                    duration: duration
                });
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