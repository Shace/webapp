'use strict';

// Declare app level module which depends on external plugins and internal modules
angular.module('shace', [
    'ngCookies',
    'ngResource',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ngTagsInput',
    'shace.filters',
    'shace.resources',
    'shace.services',
    'shace.directives',
    'shace.controllers'    
]);

angular.module('shace.filters', []);
angular.module('shace.resources', []);
angular.module('shace.services', ['shace.resources']);
angular.module('shace.directives', []);
angular.module('shace.controllers', ['shace.resources', 'shace.services']);

require('js/app/*');
require('js/resources/*');
require('js/filters/*');
require('js/directives/*');
require('js/services/*');
require('js/controllers/*');