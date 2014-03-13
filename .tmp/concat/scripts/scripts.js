'use strict';
// Declare app level module which depends on filters, and services
angular.module('shace', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'shace.filters',
  'shace.resources',
  'shace.services',
  'shace.directives',
  'shace.controllers'
]).config([
  '$routeProvider',
  '$httpProvider',
  function ($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    });
    $routeProvider.when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    });
    $routeProvider.when('/logout', {
      templateUrl: 'partials/home.html',
      controller: 'LogoutController'
    });
    $routeProvider.when('/me', {
      templateUrl: 'partials/users/me.html',
      controller: 'MeController'
    });
    $routeProvider.when('/events/new/:token', {
      templateUrl: 'partials/events/new.html',
      controller: 'EventsNewController'
    });
    $routeProvider.when('/events/new', {
      templateUrl: 'partials/events/new.html',
      controller: 'EventsNewController'
    });
    $routeProvider.when('/events/:token', {
      templateUrl: 'partials/events/event.html',
      controller: 'EventController'
    });
    $routeProvider.when('/events/:eventToken/medias/:id', {
      templateUrl: 'partials/medias/media.html',
      controller: 'MediaController'
    });
    $routeProvider.otherwise({ redirectTo: '/' });
    // HTTP interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$rootScope',
      function ($q, $rootScope) {
        return {
          'request': function (config) {
            // Auto inject access token if available
            if ($rootScope.shace.accessToken && (!config.params || config.params && angular.isUndefined(config.params.access_token))) {
              if (!config.params) {
                config.params = {};
              }
              config.params.access_token = $rootScope.shace.accessToken.token;
            }
            $rootScope.showLoadingIndicator = true;
            return config || $q.when(config);
          },
          'response': function (response) {
            $rootScope.showLoadingIndicator = false;
            return response || $q.when(response);
          },
          'responseError': function (rejection) {
            $rootScope.showLoadingIndicator = false;
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]).run(function ($rootScope, shace) {
  /* Expose some global application data to root scope */
  $rootScope.shace = shace;
  $rootScope.showLoadingIndicator = false;
  shace.init();
});
'use strict';
/* Services */
angular.module('shace.services', []).value('version', '0.1').value('config', { apiAccessPoint: '//localhost:9000' }).factory('shace', [
  '$q',
  '$cookieStore',
  'AccessToken',
  'Users',
  function ($q, $cookieStore, AccessToken, Users) {
    var shace = {
        accessToken: false,
        user: false
      };
    /*
         * Init the application
         */
    shace.init = function () {
      var now = new Date().getTime();
      /*
             * Retrieve access token
             * If no access token is available or if it expired,
             * requests a new one
             */
      (function () {
        var deferred = $q.defer();
        if (shace.accessToken === false) {
          if (!retrieveStoredAccessToken()) {
            shace.requestAccessToken().then(function () {
              deferred.resolve();
            });
          } else {
            deferred.resolve();
          }
        } else if (shace.accessToken.expiration < now) {
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }().then(function () {
        // If user is logged in, retrieve its infos
        shace.retrieveUserInfos().catch(function (response) {
          // If infos are not retrieved, token must be invalid.
          // Request a new one and retry
          shace.requestAccessToken().then(function () {
            shace.retrieveUserInfos();
          });
        });
      }));
    };
    /*
         * Requests a new access token
         * If no email/password is given, a guest token is retrieved
         */
    shace.requestAccessToken = function (email, password) {
      var deferred = $q.defer(), params = {};
      ;
      if (email && password) {
        params = {
          email: email,
          password: password,
          auto_renew: true
        };
      }
      AccessToken.request(params, function (token) {
        shace.accessToken = {
          token: token.token,
          type: token.type,
          autoRenew: token.auto_renew,
          creation: token.creation,
          expiration: token.expiration
        };
        storeAccessToken();
        deferred.resolve();
      }, function (response) {
        deferred.reject();
      });
      return deferred.promise;
    };
    /*
         * Logout the user (delete access token and request a new guest one)
         */
    shace.logout = function () {
      shace.accessToken = false;
      shace.user = false;
      shace.requestAccessToken();
    };
    /*
         * Registers a new user and login
         */
    shace.signup = function (email, password) {
      var deferred = $q.defer();
      Users.save({}, {
        email: email,
        password: password
      }, function (user) {
        deferred.resolve(user);
      }, function (response) {
        deferred.reject();
      });
      return deferred.promise;
    };
    /*
         * Requests user infos and populate shace object
         */
    shace.retrieveUserInfos = function () {
      var deferred = $q.defer();
      if (shace.accessToken.type == 'user') {
        Users.me({}, function (user) {
          shace.user = user;
          deferred.resolve(user);
        }, function (response) {
          deferred.reject(response);
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    };
    // Private methods
    /*
         * Retrieve a previously stored access token
         */
    function retrieveStoredAccessToken() {
      var accessToken = $cookieStore.get('shace_access_token');
      if (accessToken) {
        shace.accessToken = accessToken;
        return true;
      }
      return false;
    }
    /*
         * Store the user access token in a persistant store (cookies)
         */
    function storeAccessToken() {
      $cookieStore.put('shace_access_token', shace.accessToken);
    }
    return shace;
  }
]).factory('uploader', [
  '$q',
  '$rootScope',
  'shace',
  'config',
  'Medias',
  function ($q, $rootScope, shace, config, Medias) {
    var uploader = {
        queue: [],
        maxSimultaneousUpload: 3
      };
    /*
         * Add files to the upload queue
         */
    uploader.queueFiles = function (files) {
      uploader.queue = uploader.queue.concat(files);
      queueChanged();
    };
    /*
         * Called when elements are added or removed from the upload queue
         */
    function queueChanged() {
      var i, l, uploading = 0, file;
      // Check if there are files to upload (and limit is not reached)
      for (i = 0, l = uploader.queue.length; i < l; i += 1) {
        file = uploader.queue[i];
        if (file.isUploading) {
          uploading += 1;
        } else if (uploading < uploader.maxSimultaneousUpload) {
          uploadFile(file);
        }
      }
    }
    /*
         * Launch the upload of a file via XMLHttpRequest 2
         */
    function uploadFile(file) {
      var url, xhr = new XMLHttpRequest(), formData = new FormData();
      ;
      // Only handle medias at this time
      if (file.media) {
        url = Medias.getUploadUrl(file.media);
      } else {
        return;
      }
      file.isUploading = true;
      if (shace.accessToken) {
        url += '?access_token=' + shace.accessToken.token;
      }
      // Request event handlers
      xhr.addEventListener('progress', function (event) {
        $rootScope.$apply(function () {
          console.log('upload progress', event);
        });
      }, false);
      xhr.addEventListener('load', function (event) {
        $rootScope.$apply(function () {
          console.log('upload load', event);
          uploadDone(file, event);
        });
      }, false);
      // Open connection
      xhr.open('POST', url);
      formData.append('file', file);
      // Execute request
      xhr.send(formData);
    }
    /*
         * Called when a file has been uploaded
         */
    function uploadDone(file, event) {
      var index = uploader.queue.indexOf(file);
      file.isUploading = false;
      file.done = true;
      if (index != -1) {
        uploader.queue.splice(index, 1);
      }
      (file.callback || angular.identity)();
      queueChanged();
    }
    return uploader;
  }
]);
;
'use strict';
/* Resources */
angular.module('shace.resources', []).factory('AccessToken', [
  '$resource',
  'config',
  function ($resource, config) {
    var AccessToken = $resource(config.apiAccessPoint + '/access_token', {}, {
        request: {
          method: 'POST',
          params: {
            email: false,
            password: false,
            auto_renew: false
          }
        }
      });
    return AccessToken;
  }
]).factory('Users', [
  '$resource',
  'config',
  function ($resource, config) {
    var Users = $resource(config.apiAccessPoint + '/users/:id', { id: '@id' }, {
        me: {
          url: config.apiAccessPoint + '/users/me',
          method: 'GET'
        },
        update: { method: 'PUT' }
      });
    return Users;
  }
]).factory('Events', [
  '$resource',
  'config',
  function ($resource, config) {
    var Events = $resource(config.apiAccessPoint + '/events/:token', {}, { update: { method: 'PUT' } });
    return Events;
  }
]).factory('Medias', [
  '$resource',
  'config',
  function ($resource, config) {
    var Medias = $resource(config.apiAccessPoint + '/events/:eventToken/medias/:id', {}, { update: { method: 'PUT' } });
    Medias.getUploadUrl = function (media) {
      return config.apiAccessPoint + '/events/' + media.event + '/medias/' + media.id;
    };
    return Medias;
  }
]);
;
'use strict';
/* Controllers */
angular.module('shace.controllers', []).controller('MainController', [
  '$scope',
  '$route',
  function ($scope, $route) {
    $scope.isHome = true;
    $scope.$on('$routeChangeSuccess', function (event, route) {
      $scope.isHome = route.controller === 'HomeController';
    });
  }
]).controller('HomeController', [
  '$scope',
  '$location',
  'Events',
  function ($scope, $location, Events) {
    $scope.openEvent = function () {
      if ($scope.token) {
        Events.get({ token: $scope.token }, function (reponse) {
          $location.path('/events/' + $scope.token);
        }, function (response) {
          // Event doesn't exists, redirect to create event page
          if (response.status == 404) {
            $location.path('/events/new/' + $scope.token);
          }
        });
      }
    };
  }
]).controller('LoginController', [
  '$scope',
  '$location',
  'shace',
  function ($scope, $location, shace) {
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
  }
]).controller('LogoutController', [
  '$scope',
  '$location',
  'shace',
  function ($scope, $location, shace) {
    shace.logout();
    $location.path('/');
  }
]).controller('MeController', [
  '$scope',
  '$location',
  '$filter',
  'shace',
  function ($scope, $location, $filter, shace) {
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
      birth_date = new Date($scope.birth_date).getTime();
      if (birth_date) {
        shace.user.birth_date = birth_date;
      }
      shace.user.$update();
    };
  }
]).controller('EventsNewController', [
  '$scope',
  '$route',
  '$location',
  'Events',
  function ($scope, $route, $location, Events) {
    $scope.event = {
      token: $route.current.params.token || '',
      privacy: 'public'
    };
    $scope.createEvent = function () {
      Events.save({}, $scope.event, function (event) {
        $location.path('/events/' + event.token);
      });
    };
  }
]).controller('EventController', [
  '$scope',
  '$route',
  '$rootScope',
  'shace',
  'uploader',
  'Events',
  'Medias',
  function ($scope, $route, $rootScope, shace, uploader, Events, Medias) {
    $scope.event = Events.get({ token: $route.current.params.token });
    $scope.saveEvent = function () {
      $scope.event.$update({ token: $scope.event.token });
    };
    $scope.uploadMedias = function (files) {
      var i, l, file, medias = [];
      // Create an empty media for each file
      for (i = 0, l = files.length; i < l; i += 1) {
        medias.push({});
      }
      ;
      Medias.save({ eventToken: $scope.event.token }, { medias: medias }, function (response) {
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
          $scope.event = Events.get({ token: $route.current.params.token });
        }
      }
    };
  }
]).controller('MediaController', [
  '$scope',
  '$route',
  'Medias',
  function ($scope, $route, Medias) {
    $scope.media = Medias.get({
      eventToken: $route.current.params.eventToken,
      id: $route.current.params.id
    });
  }
]);
;
'use strict';
/* Filters */
angular.module('shace.filters', []).filter('interpolate', [
  'version',
  function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/gm, version);
    };
  }
]);
'use strict';
/* Directives */
angular.module('shace.directives', []).directive('fileSelect', [
  '$http',
  function ($http) {
    return {
      restrict: 'E',
      template: '<input class="file-selector-input" type="file" multiple>',
      link: function (scope, element, attrs) {
        element.find('.file-selector-input').on('change', function (event) {
          var i, l, files = [];
          // Create a list of files from the FileList object
          for (i = 0, l = this.files.length; i < l; i += 1) {
            files.push(this.files[i]);
          }
          if (attrs.select) {
            scope.$apply(function () {
              scope.$eval(attrs.select, { files: files });
            });
          }
        });
      }
    };
  }
]);
;