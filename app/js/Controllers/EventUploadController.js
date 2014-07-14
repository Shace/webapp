'use strict';

angular.module('shace.controllers'). controller('EventUploadController',
    ['$scope', '$rootScope', 'Uploader', 'Medias', function ($scope, $rootScope, Uploader, Medias) {
        // Event will need to be reloaded after leaving upload page
        $scope.event.needReload = true;

        $scope.queue = Uploader.queue;
        $scope.uploadDone = false;
        
        Uploader.onUploadDone = function (file, progress) {
            // Get media to show thumbnail
            if (file.media) {
                Medias.get({
                    eventToken: file.media.event,
                    id: file.media.id
                }, function(media) {
                    file.media = media;
                });
            }
            // Check for upload completion
            if (Uploader.getPendingFilesCount() === 0) {
                $scope.uploadDone = true;
            }            
        };
    }]);