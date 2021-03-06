'use strict';

angular.module('shace.services').
    factory('Uploader', ['$q', '$rootScope', 'Shace', 'Config', 'Medias',
        function ($q, $rootScope, Shace, Config, Medias) {

            var Uploader = {
                queue: [],
                maxSimultaneousUpload: 10,
                onUploadDone: angular.noop,
                onUploadProgress: angular.noop
            };

            /*
             * Add files to the upload queue
             */
            Uploader.queueFiles = function (files) {
                var i, l, file;

                for (i = 0, l = files.length; i < l; i += 1) {
                    file = files[i];

                    file.isUploading = false;
                    file.done = false;
                    file.progress = 0;
                }
                Uploader.queue = Uploader.queue.concat(files);
                queueChanged();
            };

            /*
             * Return the number of files in the upload queue
             * that are not uploaded yet
             */
            Uploader.getPendingFilesCount = function () {
                var i, l, count = 0;

                for (i = 0, l = Uploader.queue.length; i < l; i += 1) {
                    if (!Uploader.queue[i].done) {
                        count += 1;
                    }
                }
                return count;
            };

            /*
             * Called when elements are added or removed from the upload queue
             */
            function queueChanged() {
                var i, l, uploading = 0, file;

                // Check how many files are currently uploading
                for (i = 0, l = Uploader.queue.length; i < l; i += 1) {
                    file = Uploader.queue[i];

                    if (file.isUploading) {
                        uploading += 1;
                    }
                }

                // Launch new uploads if simultaneous upload limit is not reached yet
                if (uploading < Uploader.maxSimultaneousUpload) {
                    for (i = 0, l = Uploader.queue.length; i < l && uploading < Uploader.maxSimultaneousUpload; i += 1) {
                        file = Uploader.queue[i];

                        if (!file.done && !file.isUploading) {
                            uploadFile(file);
                            uploading += 1;
                        }
                    }
                }
            }

            /*
             * Launch the upload of a file via XMLHttpRequest 2
             */
            function uploadFile(file) {
                var
                    url,
                    xhr = new XMLHttpRequest(),
                    formData = new FormData()
                ;

                if (file.media) {
                    url = Medias.getUploadUrl(file.media);
                } else if (file.uploadURL) {
                    url = file.uploadURL;
                } else {
                    return;
                }

                file.isUploading = true;

                if (Shace.accessToken) {
                    url += '?access_token='+Shace.accessToken.token;
                }

                // Request event handlers
                xhr.upload.addEventListener('progress', function (event) {
                    $rootScope.$apply(function() {
                        uploadProgress(file, event);
                    });
                }, false);
                xhr.upload.addEventListener('load', function (event) {
                    // Update progress: upload is not done yet, waiting for server response
                    $rootScope.$apply(function() {
                        uploadProgress(file, event);
                    });
                }, false);
                xhr.upload.addEventListener('error', function (event) {
                    $rootScope.$apply(function() {
                        uploadDone(file, event);
                    });
                }, false);
                xhr.upload.addEventListener('abort', function (event) {
                    $rootScope.$apply(function() {
                        uploadDone(file, event);
                    });
                }, false);
                xhr.addEventListener('load', function (event) {
                    var response, json;

                    $rootScope.$apply(function() {
                        response = xhr.response;
                        try {
                            json = JSON.parse(response);
                            response = json;
                        } catch (e) {}
                        uploadDone(file, event, response);
                    });
                }, false);

                // Open connection
                xhr.open('POST', url);
                formData.append('file', file);
                // Execute request
                xhr.send(formData);
            }

            /*
             * Called when a file upload has progressed
             */
            function uploadProgress(file, event) {
                // Update file progress
                file.progress = (event.loaded / event.total)*100;

                // Emit event
                Uploader.onUploadProgress(file, event);
            }

            /*
             * Called when a file has been uploaded
             */
            function uploadDone(file, event, response) {
                // Update file infos
                file.isUploading = false;
                file.done = true;
                file.progress = 100;

                // Execute file-specific callback
                (file.callback || angular.noop)();

                // Emit event
                Uploader.onUploadDone(file, event, response);

                queueChanged();
            }

            return Uploader;
        }]);