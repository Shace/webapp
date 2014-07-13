'use strict';

angular.module('shace.services')
    .factory('Shace', ['$q', '$cookieStore', 'config', 'AccessToken', 'Users',
        function ($q, $cookieStore, config, AccessToken, Users) {

            var Shace = {
                accessToken: false,
                user: false,
                access: {}
            };

            /*
             * Init the application
             */
            Shace.init = function () {
                var now = (new Date()).getTime();

                /*
                 * Retrieve access token
                 * If no access token is available or if it expired,
                 * requests a new one
                 */
                (function () {
                    var deferred = $q.defer();

                    if (Shace.accessToken === false) {
                        if (!retrieveStoredAccessToken()) {
                            Shace.requestAccessToken().then(function () {
                                deferred.resolve();
                            });
                        } else {
                            deferred.resolve();
                        }
                    } else if (Shace.accessToken.expiration < now) {
                        // Expired token: request a new one
                        Shace.accessToken = false;
                        Shace.requestAccessToken().then(function () {
                            deferred.resolve();
                        });
                    } else {
                        deferred.resolve();
                    }

                    return deferred.promise;
                }()).then(function () {
                        if (Shace.accessToken.type === config.accessTokenTypes.user) {
                            // If user is logged in, retrieve its infos
                            Shace.retrieveUserInfos().catch(function (response) {
                                Shace.accessToken = false;
                                // If infos are not retrieved, token must be invalid.
                                // Request a new one and retry
                                Shace.requestAccessToken().then(function () {
                                    Shace.retrieveUserInfos();
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
            Shace.requestAccessToken = function (email, password, autoRenew) {
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
                    Shace.accessToken = {
                        token: response.token,
                        type: response.type,
                        autoRenew: response.auto_renew,
                        creation: response.creation,
                        expiration: response.expiration
                    };
                    storeAccessToken();
                }

                if (Shace.accessToken) {
                    AccessToken.update({
                        accessToken: Shace.accessToken.token
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
            Shace.logout = function () {
                Shace.accessToken = false;
                Shace.user = false;
                Shace.requestAccessToken();
            };

            /*
             * Registers a new user and login
             */
            Shace.signup = function (email, password) {
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
             * Requests user infos and populate Shace object
             */
            Shace.retrieveUserInfos = function () {
                var deferred = $q.defer();

                if (Shace.accessToken.type === 'user') {
                    Users.me({}, function (user) {
                        Shace.user = user;
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
            Shace.access.getPermissionOnEvent = function (event, permission) {
                return config.permissionsLevels[event.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a tag for the current user
             */
            Shace.access.getPermissionOnTag = function (tag, permission) {
                return config.permissionsLevels[tag.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a comment for the current user
             */
            Shace.access.getPermissionOnComment = function (comment, permission) {
                return config.permissionsLevels[comment.permission.toLowerCase()] >= config.permissionsLevels[permission.toLowerCase()];
            };

            // Private methods

            /*
             * Retrieve a previously stored access token
             */
            function retrieveStoredAccessToken () {
                var accessToken = $cookieStore.get('shace_access_token');

                if (accessToken) {
                    Shace.accessToken = accessToken;
                    return true;
                }
                return false;
            }

            /*
             * Store the user access token in a persistant store (cookies)
             */
            function storeAccessToken () {
                $cookieStore.put('shace_access_token', Shace.accessToken);
            }

            return Shace;
        }]);