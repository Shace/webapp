'use strict';

/* Services */

angular.module('shace.services', []).
    /*
    * Version
    * The application version
    */
    value('version', '0.1').

    /*
    * Main website configuration
    */
    value('config', {
        apiAccessPoint: '//localhost:9000'
    }).

    /*
    * Shace service
    * Encapsulate communications with Shace API
    */
    factory('shace',
        ['$q', '$cookieStore', 'AccessToken', 'Users',
        function ($q, $cookieStore, AccessToken, Users) {

        var shace = {
            accessToken: false,
            user: false
        };

        /*
         * Init the application
         */
        shace.init = function () {
            var now = (new Date()).getTime();

            /*
             * Retrieve access token
             * If no access token is available or if it expired,
             * requests a new one
             */
            (function () {
                var deferred = $q.defer();

                if (shace.accessToken === false) {
                    if (!retrieveStoredAccessToken()) {
                        shace.requestAccessToken().then(function () {
                            deferred.resolve();
                        });
                    } else {
                        deferred.resolve();
                    }
                } else if (shace.accessToken.expiration < now) {
                    // TODO: handle expired token
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            }()).then(function () {

                // If user is logged in, retrieve its infos
                shace.retrieveUserInfos().catch(function (response) {
                    // If infos are not retrieved, token must be invalid.
                    // Request a new one and retry
                    shace.requestAccessToken().then(function () {
                        shace.retrieveUserInfos();
                    });
                });

            });
        };

        /*
         * Requests a new access token
         * If no email/password is given, a guest token is retrieved
         */
        shace.requestAccessToken = function (email, password) {
            var
                deferred = $q.defer(),
                params = {}
            ;

            if (email && password) {
                params = {
                    email: email,
                    password: password,
                    auto_renew: true
                };
            }

            AccessToken.request(params, function (token) {
                shace.accessToken = {
                    token: token.token,
                    type: token.type,
                    autoRenew: token.auto_renew,
                    creation: token.creation,
                    expiration: token.expiration
                };
                storeAccessToken();
                deferred.resolve();
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        /*
         * Logout the user (delete access token and request a new guest one)
         */
        shace.logout = function () {
            shace.accessToken = false;
            shace.user = false;
            shace.requestAccessToken();
        };

        /*
         * Registers a new user and login
         */
        shace.signup = function (email, password) {
            var deferred = $q.defer();

            Users.save({}, {
                email: email,
                password: password
            }, function (user) {
                deferred.resolve(user);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        /*
         * Requests user infos and populate shace object
         */
        shace.retrieveUserInfos = function () {
            var deferred = $q.defer();

            if (shace.accessToken.type === 'user') {
                Users.me({}, function (user) {
                    shace.user = user;
                    deferred.resolve(user);
                }, function (response) {
                    deferred.reject(response);
                });
            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        // Private methods

        /*
         * Retrieve a previously stored access token
         */
        function retrieveStoredAccessToken () {
            var accessToken = $cookieStore.get('shace_access_token');

            if (accessToken) {
                shace.accessToken = accessToken;
                return true;
            }
            return false;
        }

        /*
         * Store the user access token in a persistant store (cookies)
         */
        function storeAccessToken () {
            $cookieStore.put('shace_access_token', shace.accessToken);
        }

        return shace;
    }]).

    /*
     * Media upload service
     */
    factory('Uploader',
        ['$q', '$rootScope', 'shace', 'config', 'Medias',
        function ($q, $rootScope, shace, config, Medias) {

        var Uploader = {
            queue: [],
            maxSimultaneousUpload: 3
        };

        /*
         * Add files to the upload queue
         */
        Uploader.queueFiles = function (files) {
            Uploader.queue = Uploader.queue.concat(files);
            queueChanged();
        };

        /*
         * Called when elements are added or removed from the upload queue
         */
        function queueChanged() {
            var i, l, uploading = 0, file;

            // Check if there are files to upload (and limit is not reached)
            for (i = 0, l = Uploader.queue.length; i < l; i += 1) {
                file = Uploader.queue[i];
                if (file.isUploading) {
                    uploading += 1;
                } else if (!file.done && uploading < Uploader.maxSimultaneousUpload) {
                    uploadFile(file);
                }
            }
        }

        /*
         * Launch the upload of a file via XMLHttpRequest 2
         */
        function uploadFile(file) {
            var
                url,
                xhr = new XMLHttpRequest(),
                formData = new FormData()
            ;

            // Only handle medias at this time
            if (file.media) {
                url = Medias.getUploadUrl(file.media);
            } else {
                return;
            }

            file.isUploading = true;

            if (shace.accessToken) {
                url += '?access_token='+shace.accessToken.token;
            }

            // Request event handlers
            xhr.upload.addEventListener('progress', function (event) {
                $rootScope.$emit('FileUploadProgress', file, event);
            }, false);
            xhr.upload.addEventListener('load', function (event) {
                $rootScope.$emit('FileUploadDone', file, event);
                $rootScope.$apply(function() {
                    uploadDone(file, event);
                });
            }, false);

            // Open connection
            xhr.open('POST', url);
            formData.append('file', file);
            // Execute request
            xhr.send(formData);
        }

        /*
         * Called when a file has been uploaded
         */
        function uploadDone(file, event) {
            file.isUploading = false;
            file.done = true;

            (file.callback || angular.noop)();

            queueChanged();
        }

        return Uploader;
    }]).
    
    /*
    * Notifications service
    */
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
        
        return Notifications;
    }])
;