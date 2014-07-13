'use strict';

angular.module('shace.services')
    .factory('Shace', ['$q', '$cookieStore', 'config', 'AccessToken', 'Users',
        function ($q, $cookieStore, config, AccessToken, Users) {

            var shace = {
                accessToken: false,
                user: false,
                access: {}
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
                        // Expired token: request a new one
                        shace.accessToken = false;
                        shace.requestAccessToken().then(function () {
                            deferred.resolve();
                        });
                    } else {
                        deferred.resolve();
                    }

                    return deferred.promise;
                }()).then(function () {
                        if (shace.accessToken.type === config.accessTokenTypes.user) {
                            // If user is logged in, retrieve its infos
                            shace.retrieveUserInfos().catch(function (response) {
                                shace.accessToken = false;
                                // If infos are not retrieved, token must be invalid.
                                // Request a new one and retry
                                shace.requestAccessToken().then(function () {
                                    shace.retrieveUserInfos();
                                });
                            });
                        }
                    });
            };

            /*
             * Requests a new access token
             * If no email/password is given, a guest token is retrieved
             * Else if a guest access token already exists, it is upgraded
             */
            shace.requestAccessToken = function (email, password, autoRenew) {
                var
                    deferred = $q.defer(),
                    params = {}
                    ;

                if (angular.isUndefined(autoRenew)) {
                    autoRenew = true;
                }

                if (email && password) {
                    params = {
                        email: email,
                        password: password,
                        auto_renew: autoRenew
                    };
                }

                function updateToken (response) {
                    shace.accessToken = {
                        token: response.token,
                        type: response.type,
                        autoRenew: response.auto_renew,
                        creation: response.creation,
                        expiration: response.expiration
                    };
                    storeAccessToken();
                }

                if (shace.accessToken) {
                    AccessToken.update({
                        accessToken: shace.accessToken.token
                    }, params, function (token) {
                        updateToken(token);
                        deferred.resolve();
                    }, function (response) {
                        deferred.reject(response);
                    });
                } else {
                    AccessToken.request(params, function (token) {
                        updateToken(token);
                        deferred.resolve();
                    }, function (response) {
                        deferred.reject(response);
                    });
                }

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

            /*
             * Get permissions on an event for the current user
             */
            shace.access.getPermissionOnEvent = function (event, permission) {
                return config.permissionsLevels[event.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a tag for the current user
             */
            shace.access.getPermissionOnTag = function (tag, permission) {
                return config.permissionsLevels[tag.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a comment for the current user
             */
            shace.access.getPermissionOnComment = function (comment, permission) {
                return config.permissionsLevels[comment.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
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
        }]);