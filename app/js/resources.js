'use strict';

/* Resources */

angular.module('shace.resources', []).
  /*
   * AccessToken
   */
  factory('AccessToken', ['$resource', 'config', function ($resource, config) {
  
    var AccessToken = $resource(config.apiAccessPoint+'/access_token', {
      /* Default params */
    }, {
      /* Custom actions */
      
      /*
       * Requests a new access token
       */
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
  }]).
  
  /*
   * Users
   */
  factory('Users', ['$resource', 'config', function ($resource, config) {
  
  var Users = $resource(config.apiAccessPoint+'/users', {
      /* Default params */
    }, {
      /* Custom actions */
      
      /*
       * Requests a new access token
       */
      me: {
        url: config.apiAccessPoint+'/users/me',
        method: 'GET',
        params: {
          access_token: false
        }
      }
    });    
            
    return Users;
  }])
;