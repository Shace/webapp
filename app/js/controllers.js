'use strict';

/* Controllers */

angular.module('shace.controllers', []).

    controller('MainController', ['$scope', function ($scope) {
        $scope.isHome = true;
        
        $scope.$on('$stateChangeSuccess', function (event, route) {
            $scope.isHome = (route.controller === 'HomeController');
        });
    }]).

    controller('HomeController', ['$scope', '$location', 'Events', function ($scope, $location, Events) {
    
        $scope.openEvent = function () {
            if ($scope.token) {
                Events.get({token: $scope.token},
                // Success handler
                function(response) {
                    $location.path('/events/'+$scope.token);
                },
                // Error handler
                function (response) {
                    // Event doesn't exists, redirect to create event page
                    if (response.status === 404) {
                        $location.path('/events/new');
                    }
                });
            }
        };

    }]).
    controller('LoginController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
        
        $scope.login = function (email, password) {
            if (email && password) {
                shace.requestAccessToken(email, password).then(function () {
                    // User is logged, redirect to home
                    shace.retrieveUserInfos().finally(function () {
                        $location.path('/');
                    });
                });
            }
        };
        
        $scope.signup = function (email, password) {
            if (email && password) {
                shace.signup(email, password).then(function () {
                    $scope.login(email, password);
                });
            }
        };
        
    }]).
    controller('LogoutController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
        
        shace.logout();
        $location.path('/');

    }]).
    controller('MeController', ['$scope', '$location', '$filter', 'shace', function ($scope, $location, $filter, shace) {
        var birth_date;
        
        $scope.$watch('shace.user', function (newValue) {
            if (newValue.birth_date) {
                $scope.birth_date = $filter('date')(newValue.birth_date, 'yyyy-MM-dd');
            }
        });
        
        $scope.saveUser = function () {
            if ($scope.password) {
                shace.user.password = $scope.password;
                $scope.password = '';
            }
            birth_date = (new Date($scope.birth_date)).getTime();
            if (birth_date) {
                shace.user.birth_date = birth_date;
            }
            shace.user.$update();
        };
    }]).
    controller('EventsNewController', ['$scope', '$state', '$location', 'Events', function ($scope, $state, $location, Events) {
        $scope.event = {
            token: '',
            privacy: 'public'
        };
        
        $scope.createEvent = function () {
            Events.save({}, $scope.event, function (event) {
                $location.path('/events/'+event.token);
            });
        };
    }]).
    controller('EventController',
    ['$scope', '$state', '$rootScope', 'shace', 'uploader', 'Events', 'Medias',
    function ($scope, $state, $rootScope, shace, uploader, Events, Medias) {
    
        $scope.event = Events.get({token: $state.params.token});
        
        $scope.saveEvent = function () {
            $scope.event.$update({token: $scope.event.token});
        };
        
        $scope.uploadMedias = function (files) {
            var i, l, file, medias = [];
            
            // Create an empty media for each file
            for (i = 0, l = files.length; i < l; i += 1) {
                medias.push({});
            }
            Medias.save({
                eventToken: $scope.event.token
            }, {
                medias: medias
            }, function (response) {
                var i, l, media;

                if (response.medias.length === files.length) {
                    // Assign a media to each file to upload
                    for (i = 0, l = response.medias.length; i < l; i += 1) {
                        files[i].media = response.medias[i];
                        files[i].callback = uploadDone;
                    }
                    
                    // Upload the files
                    uploader.queueFiles(files);
                }
                $rootScope.showLoadingIndicator = true;
            });
            
            function uploadDone() {
                var i, l, done = true;
                
                for (i = 0, l = uploader.queue.length; i < l; i += 1) {
                    if (!uploader.queue[i].done) {
                        done = false;
                        break;
                    }
                }
                if (done) {
                    $rootScope.showLoadingIndicator = false;
                    $scope.event = Events.get({token: $state.params.token});
                }
            }
        };
    }]).
    controller('MediaController', ['$scope', '$state', 'Medias', function ($scope, $state, Medias) {

        $scope.media = Medias.get({
            eventToken: $state.params.eventToken,
            id: $state.params.id
        });

    }])
;