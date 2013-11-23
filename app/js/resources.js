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
  }])
;