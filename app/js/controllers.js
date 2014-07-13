'use strict';

/* Controllers */

angular.module('shace.controllers', []).

    controller('MainController', ['$scope', function ($scope) {
        $scope.isHome = true;
        $scope.currentState = undefined;
        
        $scope.$on('$stateChangeSuccess', function (event, state) {
            $scope.isHome = (state.controller === 'HomeController');
            $scope.currentState = state;
        });
        
        $scope.keyboardAction = function (event) {
            $scope.$broadcast('keyboadAction', event);
        };
    }]).
    
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
    }]).

    controller('HomeController',
        ['$scope', '$q', '$state', '$modal', 'Notifications', 'Events',
        function ($scope, $q, $state, $modal, Notifications, Events) {
    
        /*
         * Return auto-completed actions for input token
         */
        $scope.getInputTokenActions = function(inputToken) {
            var
                deferred = $q.defer(),
                actions = [],
                createAction, createPrivateAction
            ;
            
            // Add create actions
            createAction = {
                type: 'create',
                token: inputToken
            };
            createPrivateAction = {
                type: 'create-private',
                token: inputToken
            };
            
            // Check if an event with the given token exists
            Events.get({token:inputToken},
            // Success handler
            function(response) {
                createAction.enabled = false;
                actions.push({
                    type: 'access',
                    token: response.token,
                    event: response
                });
                actions.push(createPrivateAction);
                deferred.resolve(actions);
            },
            // Error handler
            function(response) {
                if (response.status === 403) {
                    actions.push({
                        type: 'access',
                        token: inputToken,
                        privacy: 'protected'
                    });
                    createAction.enabled = false;
                    actions.push(createPrivateAction);
                } else {
                    actions.push(createAction);
                }
                deferred.resolve(actions);
            });
            return deferred.promise;
        };
        
        /*
         * Handler of input token select event
         */
        $scope.inputTokenActionSelected = function () {
            var action = $scope.inputToken;
            
            if (!action) {
                return ;
            }
            if (action.type === 'create') {
                $scope.createEvent('public', action.token);
            } else if (action.type === 'create-private') {
                $scope.createEvent('private', action.token);
            } else if (action.type === 'access') {
                if (action.privacy === 'protected') {
                    $scope.eventToken = action.token;
                    $modal.open({
                        controller: 'AccessProtectedEventController',
                        templateUrl: 'partials/home/access-protected.html',
                        scope: $scope
                    });
                } else {
                    $state.go('event.medias.rootBucket', {token: action.token});
                }
            }
        };
    
        /*
         * Access an event with a given token
         */
        $scope.accessEvent = function (token) {
            if (token) {
                Events.get({token: token},
                // Success handler
                function(response) {
                    $state.go('event.medias.rootBucket', {token: token});
                },
                // Error handler
                function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        /*
         * Create an event and redirect to the event page
         */
        $scope.createEvent = function(privacy, token) {
            var name = 'Untitled event';
            
            Events.save({}, {token: token, privacy: privacy, name:name}, function (event) {
                $state.go('event.medias.rootBucket', {token: event.token});
            }, function (response) {
                Notifications.notifyError(response.data);
            });
        };

    }]).
    controller('AccessProtectedEventController',
    ['$scope', '$modalInstance', '$state', 'Events', 'Notifications',
    function ($scope, $modalInstance, $state, Events, Notifications) {
        $scope.form = {
            password: ''
        };
        
        $scope.submit = function () {
            var
                token = $scope.eventToken,
                password = $scope.form.password
            ;
            
            $scope.passwordInvalid = false;
            
            if (!password) {
                $scope.passwordInvalid = true;
            }
            
            Events.access({token: token}, {password: password},
                function(response) {
                    $state.go('event.medias.rootBucket', {token: token});
                    $modalInstance.close();
                },
                function (response) {
                    $scope.passwordInvalid = true;
                }
            );
        };
    }]).
    controller('LoginController', ['$scope', '$location', '$timeout', 'Notifications', 'shace', function ($scope, $location, $timeout, Notifications, shace) {
    
        $scope.rememberMe = true;
        
        $scope.login = function () {
            var
                email = $scope.email,
                password = $scope.password,
                autoRenew = $scope.rememberMe
            ;
            
            if (email && password) {
                shace.requestAccessToken(email, password, autoRenew).then(function () {
                    // User is logged, redirect to home
                    shace.retrieveUserInfos().finally(function () {
                        $location.path('/');
                    });
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        $scope.signup = function () {
            var
                email = $scope.email,
                password = $scope.password
            ;
            
            if (email && password) {
                shace.signup(email, password).then(function () {
                    $scope.login();
                }, function (response) {
                    Notifications.notifyError(response.data);
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
    controller('EventController',
    ['$scope', '$state', '$rootScope', '$modal', 'shace', 'Notifications', 'Uploader', 'Events', 'Medias',
    function ($scope, $state, $rootScope, $modal, shace, Notifications, Uploader, Events, Medias) {
        $scope.loadEvent = function () {
            $scope.event = Events.get({token: $state.params.token}, function () {
                $scope.event.currentBucket = false;
            });
        };
        
        $scope.canEditInfos = function () {
            if (!$scope.event || !$scope.event.$resolved || !$scope.event.token) {
                return false;
            }
            return shace.access.getPermissionOnEvent($scope.event, 'administrate');
        };

        $scope.saveInfos = function () {
            $scope.event.$update({token: $scope.event.token}).then(function(){}, function (response) {
                Notifications.notifyError(response.data);
            });
        };
        
        $scope.openPrivacyOptions = function () {
            $modal.open({
                controller: 'EventPrivacyOptionsController',
                templateUrl: 'partials/events/privacy/modal.html',
                scope: $scope
            });
        };
        
        $scope.loadEvent();
    }]).
    controller('EventPrivacyOptionsController',
    ['$scope', '$state', '$modalInstance', 'Notifications',
    function ($scope, $state, $modalInstance, Notifications) {
        $scope.view = 'modes';
        
        $scope.privacy = $scope.event.privacy;
        
        function initForm() {
            $scope.form = {
                loading: false,
                showToken: false,
                token: '',
                password: '',
                passwordConfirm: ''
            };
        }
        
        initForm();
        
        $scope.selectPrivacy = function (privacy) {
            $scope.privacy = privacy;
        };
    
        $scope.changePrivacy = function (privacy) {
            initForm();
            if ((privacy === 'public' || privacy === 'protected') && $scope.event.privacy === 'private') {
                $scope.form.showToken = true;
            }
            $scope.view = 'form-'+privacy;
        };
        
        $scope.submitForm = function () {
            var
                eventCopy = angular.copy($scope.event),
                tokenChanged = false
            ;
            
            if ($scope.view === 'modes') {
                return;
            }
            
            if (($scope.privacy === 'public' || $scope.privacy === 'protected') && $scope.event.privacy === 'private') {
                $scope.tokenInvalid = false;

                if (!$scope.form.token) {
                    $scope.tokenInvalid = true;
                    return;
                }
                $scope.event.token = $scope.form.token;
                tokenChanged = true;
            }
            
            if ($scope.privacy === 'protected') {
                $scope.passwordInvalid = false;
                $scope.passwordMatchInvalid = false;
                
                if (!$scope.form.password) {
                    $scope.passwordInvalid = true;
                    return;
                }
                else if ($scope.form.password !== $scope.form.passwordConfirm) {
                    $scope.passwordMatchInvalid = true;
                    return;
                }
                $scope.event.password = $scope.form.password;
            } else if ($scope.privacy === 'private') {
                tokenChanged = true;
            }
            
            $scope.event.privacy = $scope.privacy;

            $scope.form.loading = true;
            $scope.event.$update({token: eventCopy.token}).then(function(response){
                $scope.form.loading = false;
                $scope.view = 'modes';
                Notifications.notifySuccess('Event privacy changed successfully');
                if (tokenChanged) {
                    $state.go('event.medias.rootBucket', {token: response.token});
                }
                $modalInstance.close();
            }, function (response) {
                $scope.form.loading = false;
                Notifications.notifyError(response.data);
                $scope.event = eventCopy;
            });
        };

    }]).
    controller('EventUploadController',
    ['$scope', '$rootScope', 'Uploader', function ($scope, $rootScope, Uploader) {
        // Event will need to be reloaded after leaving upload page
        $scope.event.needReload = true;
    
        $scope.queue = Uploader.queue;
        $scope.uploadDone = false;
    
        $rootScope.$on('FileUploadDone', function (event, file, progress) {
            if (Uploader.getPendingFilesCount() === 0) {
                $scope.uploadDone = true;
            }
        });
    }]).
    controller('EventMediasController',
        ['$scope', '$state', '$rootScope', 'shace', 'Notifications', 'Uploader', 'Events', 'Medias',
        function ($scope, $state, $rootScope, shace, Notifications, Uploader, Events, Medias) {
        
        // Reload medias if necessary
        if ($scope.event.needReload) {
            $scope.loadEvent();
        }
        
        $scope.uploadMedias = function (files) {
            var i, l, file, medias = [];
            
            // Empty current uploader queue
            Uploader.queue = [];
            
            // Create an empty media for each file and pre-process files
            for (i = 0, l = files.length; i < l; i += 1) {
                file = files[i];
                
                medias.push({});
                
                // Add file infos
                //file.previewUrl = window.URL.createObjectURL(file);
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
                    }
                    
                    // Upload the files
                    Uploader.queueFiles(files);
                    
                    // Go to upload page
                    $state.go('event.upload');
                }
            }, function (response) {
                Notifications.notifyError(response.data);
            });
        };
    }]).
    controller('EventMediasBucketController', ['$scope', '$state', function ($scope, $state) {
    
        function getBucket(id) {
            // Search for the bucket with given id
            var
                bucket = $scope.event.bucket,
                toCheck = []
            ;
            
            if (!bucket) {
                return;
            }
            toCheck = toCheck.concat(bucket.children);
            while (toCheck.length >= 0) {
                if (bucket.id === id) {
                    return bucket;
                }
                bucket = toCheck.shift();
                toCheck = toCheck.concat(bucket.children);
            }
        }
        
        function generateBreadcrumb(bucket, current, breadcrumb) {
            var i, l;
            
            if (angular.isUndefined(breadcrumb)) {
                breadcrumb = [];
            }
            if (angular.isUndefined(current)) {
                current = $scope.event.bucket;
                current.isRoot = true;
            }
            
            if (current.id === bucket.id) {
                breadcrumb.unshift(current);
                return breadcrumb;
            }
            
            for (i = 0, l = current.children.length; i < l; ++i) {
                if (generateBreadcrumb(bucket, current.children[i], breadcrumb)) {
                    breadcrumb.unshift(current);
                    return breadcrumb;
                }
            }
            
            return false;
        }
        
        function loadBucket() {
            var bucket, beginDate, endDate;
            
            if ($state.params.bucketId) {
                bucket = getBucket(parseInt($state.params.bucketId));
            } else {
                bucket = $scope.event.bucket;
            }
    
            if (bucket) {
                $scope.bucket = bucket;
                beginDate = new Date(bucket.first);
                endDate = new Date(bucket.last);
                $scope.breadcrumb = generateBreadcrumb(bucket);
                $scope.fullBucketInterval = beginDate.getFullYear() !== endDate.getFullYear();
                // Update current bucket
                if ($scope.event.bucket.id === bucket.id) {
                    $scope.event.currentBucket = false;
                } else {
                    $scope.event.currentBucket = $scope.bucket;
                }
            }
        }
    
        // Watch for changes in event root bucket
        $scope.$watch('event.bucket', function (bucket) {
            if (bucket) {
                // If current bucket is root bucket, redirect to root bucket state
                if ($state.current.name === 'event.medias.bucket' && parseInt($state.params.bucketId) === bucket.id) {
                    $state.go('event.medias.rootBucket');
                } else {
                    loadBucket();
                }
            }
        });
    }]).
    controller('MediaController', ['$scope', '$state', '$q', 'shace', 'Medias', 'Comments', 'Notifications', 'Tags',
    function ($scope, $state, $q, shace, Medias, Comments, Notifications, Tags) {
                
        $scope.media = Medias.get({
            eventToken: $state.params.token,
            id: $state.params.id
        }, function() {
            var idx = 0;
            for (; idx < $scope.media.tags.length; ++idx) {
                $scope.media.tags[idx].index = idx;
            }
            
            // Preload prev and next images so actions happen faster
            $scope.$watch('event.medias', function (medias) {
                var currentIdx, mediaToLoad, img;
                
                if (!medias) {
                    return;
                }
                currentIdx = getMediaIndex($scope.media);
                
                // Load previous image
                if (currentIdx > 0) {
                    mediaToLoad = $scope.event.medias[currentIdx-1];
                    img = new Image();
                    img.src = mediaToLoad.image.medium;
                }
                // Load next image
                if (currentIdx+1 < $scope.event.medias.length) {
                    mediaToLoad = $scope.event.medias[currentIdx+1];
                    img = new Image();
                    img.src = mediaToLoad.image.medium;
                }
            });
        });
        
        /*
         * Send a comment
         */
        $scope.sendComment = function (comment) {
            if (comment) {
                Comments.save({mediaId: $scope.media.id, eventToken: $scope.media.event}, {
                    message: comment,
                }, function (response) {
                    $scope.media.comments.push(response);
                    $scope.comment = '';
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        /*
         * Delete a comment
         */
        $scope.deleteComment = function (comment, index) {
            var commentObject;
            
            if (comment) {
                Comments.delete({mediaId: $scope.media.id, eventToken: $scope.media.event, id: comment.id}, {}, function (response) {
                    $scope.media.comments.splice(index, 1);
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        /*
         * Return true if the current user can delete the given comment
         */
        $scope.canDeleteComment = function (comment) {
            return shace.access.getPermissionOnComment(comment, 'root');
        };
        
        $scope.canEditMediaInfos = function () {
            return (shace.user && shace.user.id === $scope.media.owner);
        };
        
        $scope.saveMediaInfos = function () {
            Medias.update({
                eventToken: $scope.media.event,
                id: $scope.media.id
            }, $scope.media, function (response) {
                
            }, function (response) {
                Notifications.notifyError(response.data);
            });
        };

        $scope.exit = function() {
            if ($scope.event.currentBucket) {
                $state.go('event.medias.bucket', {bucketId: $scope.event.currentBucket.id});
            } else {
                $state.go('event.medias.rootBucket', {token: $scope.media.event});
            }
        };
                
        $scope.onTagAdded = function(tag) {
            return Tags.save({mediaId: $scope.media.id, eventToken: $scope.media.event}, {
                name: tag.name,
            }, function (response) {
                angular.copy(response, tag);
                tag.idx = $scope.media.tags.length - 1;
            }, function (response) {
                $scope.media.tags.splice($scope.media.tags.indexOf(tag), 1);
            });
        };
        
        $scope.onTagRemoved = function(tag) {
            return Tags.delete({mediaId: $scope.media.id, eventToken: $scope.media.event, id: tag.id}, {}, function (response) {
            }, function (response) {
                $scope.media.tags.splice(tag.index, 0, tag);
                Notifications.notifyError(response.data);
            });
        };
        
        $scope.onTagRemovedBase = function(index) {
            return Tags.delete({mediaId: $scope.media.id, eventToken: $scope.media.event, id: $scope.media.tags[index].id}, {}, function (response) {
                var idx = 0;
                $scope.media.tags.splice(index, 1);
                for (; idx < $scope.media.tags.length; ++idx) {
                    $scope.media.tags.index = idx;
                }
            }, function (response) {
            });
        };
        
        $scope.editingTags = false;

        $scope.editTags = function() {
            $scope.editingTags = true;
        };

        $scope.canDeleteTag = function (tag) {
            return shace.access.getPermissionOnTag(tag, 'root');
        };
        
        $scope.prevMedia = function () {
            var currentIdx = getMediaIndex($scope.media);
            
            if (currentIdx !== false && currentIdx > 0) {
                $state.go('event.media', {id: $scope.event.medias[currentIdx-1].id});
                $scope.event.currentBucket = false;
            }
        };
        
        $scope.nextMedia = function () {
            var currentIdx = getMediaIndex($scope.media);
            
            if (currentIdx !== false && currentIdx+1 < $scope.event.medias.length) {
                $state.go('event.media', {id: $scope.event.medias[currentIdx+1].id});
                $scope.event.currentBucket = false;
            }
        };
        
        // Handle keyboard actions for navigating between medias
        $scope.$on('keyboadAction', function (event, keyEvent) {
            if (keyEvent.keyCode === 27) {
                // Echap key
                $scope.exit();
            }
            if (keyEvent.keyCode === 37) {
                // Left arrow
                $scope.prevMedia();
            } else if (keyEvent.keyCode === 39) {
                // Right arrow
                $scope.nextMedia();
            }
        });
        
        /*
         * Find media index in event
         */
        function getMediaIndex(media) {
            var i, l;
            
            for (i = 0, l = $scope.event.medias.length; i < l; ++i) {
                if ($scope.event.medias[i].id === media.id) {
                    return i;
                }
            }
            return false;
        }

    }])
;