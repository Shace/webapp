'use strict';

angular.module('shace.services').
    value('Version', '0.1').
    value('Config', {
        apiAccessPoint: '//localhost:9000',
        accessTokenTypes: {
            guest   : 'guest',
            user    : 'user'
        },
        permissionsLevels: {
            'none'          : 0,
            'read'          : 1,
            'write'         : 2,
            'administrate'  : 3,
            'root'          : 4
        }
    });