'use strict';

angular.module('shace.controllers').
    controller('MeController',
    ['$scope', '$location', '$filter', 'Shace', 'Users', 'Uploader',
    function ($scope, $location, $filter, Shace, Users, Uploader) {
        var birth_date;

        function updateBirthDate() {
            if (Shace.user && Shace.user.birth_date) {
                $scope.birth_date = $filter('date')(Shace.user.birth_date, 'yyyy-MM-dd');
            }
        }

        $scope.$watch('Shace.user', updateBirthDate);

        $scope.saveUser = function () {
            if ($scope.password) {
                Shace.user.password = $scope.password;
                $scope.password = '';
            }
            birth_date = (new Date($scope.birth_date)).getTime();
            if (birth_date) {
                Shace.user.birth_date = birth_date;
            }
            Shace.user.$update();
        };

        Users.myEvents(function (response) {
            $scope.events = response.events;
        });

        $scope.eventBackground = function (event) {
            if (!event.cover.bigCover) {
                return {};
            }
            return {
                'background-image': 'url('+event.cover.bigCover+')'
            };
        };

        $scope.changePicture = function (file) {
            // Empty current uploader queue
            Uploader.queue = [];

            file.uploadURL = Users.getPictureUploadURL(Shace.user);

            // Set handler
            Uploader.onUploadDone = function (file, event, response) {
                console.log(response);
                Shace.user.profile_picture = response;
            };

            // Queue file
            Uploader.queueFiles([file]);
        };
    }]);