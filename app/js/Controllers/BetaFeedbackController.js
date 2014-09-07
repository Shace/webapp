'use strict';

angular.module('shace.controllers').controller('BetaFeedbackController',
    ['$scope', '$modalInstance', 'Shace', 'Feedbacks',
        function ($scope, $modalInstance, Shace, Feedbacks) {

            $scope.form = {
                email: '',
                description: '',
                okForAnswer: true
            };

            $scope.submit = function () {
                var feedback = new Feedbacks();

                feedback.email = $scope.form.email;
                feedback.description = $scope.form.description;
                feedback.okForAnswer = $scope.form.okForAnswer;

                $scope.invalidEmail = false;
                if (!Shace.user && !feedback.email) {
                    $scope.invalidEmail = true;
                }
                $scope.invalidDescription = false;
                if (!feedback.description) {
                    $scope.invalidDescription = true;
                }

                if ((Shace.user || feedback.email) && feedback.description) {
                    feedback.$save(function () {
                        $scope.feedbackSent = true;
                    }, function () {
                        $modalInstance.close();
                    });
                }
            };

        }]);