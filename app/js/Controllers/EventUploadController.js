'use strict';

angular.module('shace.controllers'). controller('EventUploadController',
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
    }]);