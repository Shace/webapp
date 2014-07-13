'use strict';

angular.module('shace.controllers').
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
    }]);