'use strict';

angular.module('shace.controllers').
    controller('MediaController', ['$scope', '$state', '$q', 'Shace', 'Medias', 'Comments', 'Notifications', 'Tags',
        function ($scope, $state, $q, Shace, Medias, Comments, Notifications, Tags) {

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
                        message: comment
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
                return Shace.access.getPermissionOnComment(comment, 'root');
            };

            $scope.canEditMediaInfos = function () {
                return (Shace.user && Shace.user.id === $scope.media.owner);
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
                    name: tag.name
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
                return Shace.access.getPermissionOnTag(tag, 'root');
            };
            
            $scope.hasPrevMedia = function () {
                var currentIdx = getMediaIndex($scope.media);
                
                return (currentIdx !== false && currentIdx > 0);
            };
            
            $scope.hasNextMedia = function () {
                var currentIdx = getMediaIndex($scope.media);
                
                return (currentIdx !== false && currentIdx+1 < $scope.event.medias.length);
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

        }]);