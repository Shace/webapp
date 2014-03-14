'use strict';

var apiAccessPoint = process.env.API_URL || 'localhost:9000'

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
        apiAccessPoint: '//' + apiAccessPoint
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
                deferred.reject();
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
                deferred.reject();
            });

            return deferred.promise;
        };

        /*
         * Requests user infos and populate shace object
         */
        shace.retrieveUserInfos = function () {
            var deferred = $q.defer();

            if (shace.accessToken.type == 'user') {
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
    factory('uploader',
        ['$q', '$rootScope', 'shace', 'config', 'Medias',
        function ($q, $rootScope, shace, config, Medias) {
            var uploader = {
                queue: [],
                maxSimultaneousUpload: 3
            };

        /*
         * Add files to the upload queue
         */
        uploader.queueFiles = function (files) {
            uploader.queue = uploader.queue.concat(files);
            queueChanged();
        };

        /*
         * Called when elements are added or removed from the upload queue
         */
        function queueChanged() {
            var i, l, uploading = 0, file;

            // Check if there are files to upload (and limit is not reached)
            for (i = 0, l = uploader.queue.length; i < l; i += 1) {
                file = uploader.queue[i];
                if (file.isUploading) {
                    uploading += 1;
                } else if (uploading < uploader.maxSimultaneousUpload) {
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
            xhr.addEventListener('progress', function (event) {
                $rootScope.$apply(function() {
                    console.log('upload progress', event);
                });
            }, false);
            xhr.addEventListener('load', function (event) {
                $rootScope.$apply(function() {
                    console.log('upload load', event);
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
            var index = uploader.queue.indexOf(file);

            file.isUploading = false;
            file.done = true;
            if (index != -1) {
                uploader.queue.splice(index, 1);
            }

            (file.callback || angular.identity)();

            queueChanged();
        }

        return uploader;
    }])
;
