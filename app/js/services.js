'use strict';

/* Services */

angular.module('shace.services', []).
  /*
   * Version
   * The application version
   */
  value('version', '0.1').
  
  /*
   * Main website configuration
   */
  value('config', {
    apiAccessPoint: '//localhost:9000'
  }).
  
  /*
   * Shace service
   * Encapsulate communications with Shace API
   */
  factory('shace',
    ['$q', '$cookieStore', '$timeout', 'AccessToken', 'Users',
    function ($q, $cookieStore, $timeout, AccessToken, Users) {
  
    var shace = {
      accessToken: false,
      user: false
    };
    
    /*
     * Init the application
     */
    shace.init = function () {
      var now = (new Date()).getTime();

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
          // TODO: handle expired token                    
        } else {
          deferred.resolve();
        }
        
        return deferred.promise;
      }()).then(function () {
        
        // If user is logged in, retrieve its infos        
        shace.retrieveUserInfos();
        
      });
      
    };
      
    /*
     * Requests a new access token
     * If no email/password is given, a guest token is retrieved
     */  
    shace.requestAccessToken = function (email, password) {
      var
        deferred = $q.defer(),
        params = {}
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
      * Requests user infos and populate shace object
      */
     shace.retrieveUserInfos = function () {
       var deferred = $q.defer();
       
        if (shace.accessToken.type == 'user') {
           Users.me({}, function (user) {
             shace.user = user;
             deferred.resolve(user);
           });
        } else {
          $timeout(function () {
            deferred.resolve();
          });
        }        
        
        return deferred.promise;
     };
    
    // Private methods

    /*
     * Retrieve a previously stored access token
     */
    function retrieveStoredAccessToken () {
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
    function storeAccessToken () {
      $cookieStore.put('shace_access_token', shace.accessToken);
    }    
    
    return shace;
  }])
;