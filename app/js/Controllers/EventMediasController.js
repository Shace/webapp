'use strict';

angular.module('shace.controllers').controller('EventMediasController',
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
        }]);