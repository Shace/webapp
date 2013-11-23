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
  factory('shace', ['$q', '$cookieStore', 'AccessToken', function ($q, $cookieStore, AccessToken) {
  
    var shace = {
      accessToken: false
    };
    
    function retrieveStoredToken() {
      var accessToken = $cookieStore.get('shace_access_token');
      
      if (accessToken) {        
        shace.accessToken = accessToken;
        return true;
      }
      return false;
    }
    
    function storeAcessToken() {
      $cookieStore.put('shace_access_token', shace.accessToken);
    }
    
    /*
     * Init the application
     * If no access token is available or if it expired,
     * requests a new one
     */
    shace.init = function () {
      var now = (new Date()).getTime();

      if (shace.accessToken === false) {
        if (!retrieveStoredToken()) {          
          shace.requestAccessToken();
        }
      } else if (shace.accessToken.expiration > now) {
        // TODO: handle expired token
      }
      
    };
    
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
        storeAcessToken();
        deferred.resolve();
      }, function (response) {
        console.log(response);
        deferred.reject();
      });
      
      return deferred.promise;
    };
    
    return shace;
  }])
;