'use strict';

angular.module('shace.services')
    .factory('Shace', ['$q', '$cookieStore', '$translate', 'Config', 'AccessToken', 'Users',
        function ($q, $cookieStore, $translate, Config, AccessToken, Users) {

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
                        if (Shace.accessToken.type === Config.accessTokenTypes.user) {
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

                        // Get user language
                        if (Shace.lang === undefined) {
                            if (Shace.accessToken.lang === undefined || Shace.accessToken.lang === "none" || Shace.accessToken.lang === null) {
                                    Shace.lang = $translate.use();
                                    Shace.accessToken.lang = $translate.use();
                                    Shace.storeAccessToken();
                            } else {
                                $translate.use(Shace.accessToken.lang);
                                Shace.lang = Shace.accessToken.lang;
                            }
                        } else {
                            Shace.accessToken.lang = Shace.lang;
                            Shace.storeAccessToken();
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
                        expiration: response.expiration,
                        lang: response.lang
                    };

                    if (Shace.lang !== undefined) {
                            Shace.accessToken.lang = Shace.lang;
                    }
                    Shace.storeAccessToken();
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
                removeAccessToken();
            };

            /*
             * Registers a new user and login
             */
            Shace.signup = function (email, password, firstname, lastname) {
                var deferred = $q.defer();

                Users.save({}, {
                    email: email,
                    password: password,
                    first_name: firstname,
                    last_name: lastname
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
                        if (user.lang !== undefined && user.lang !== null && user.lang !== "none") {
                            Shace.accessToken.lang = user.lang;
                            Shace.lang = user.lang;
                            $translate.use(Shace.accessToken.lang);
                        }
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
                return Config.permissionsLevels[event.permission.toLowerCase()] >= Config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a tag for the current user
             */
            Shace.access.getPermissionOnTag = function (tag, permission) {
                return Config.permissionsLevels[tag.permission.toLowerCase()] >= Config.permissionsLevels[permission.toLowerCase()];
            };

            /*
             * Get permissions on a comment for the current user
             */
            Shace.access.getPermissionOnComment = function (comment, permission) {
                return Config.permissionsLevels[comment.permission.toLowerCase()] >= Config.permissionsLevels[permission.toLowerCase()];
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
             * Store the user access token in a persistent store (cookies)
             */
            Shace.storeAccessToken = function () {
                $cookieStore.put('shace_access_token', Shace.accessToken);
            }

            /*
             * Remove the user access token from the cookies
             */
            function removeAccessToken () {
                $cookieStore.remove('shace_access_token');
            }

            return Shace;
        }]);
