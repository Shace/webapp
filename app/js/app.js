'use strict';

// Declare app level module which depends on filters, and services
angular.module('shace', [
    'ngCookies',
    'ngResource',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'shace.filters',
    'shace.directives',
    'shace.controllers',
    'ngTagsInput'
]);

angular.module('shace.filters', []);
angular.module('shace.resources', []);
angular.module('shace.services', []);
angular.module('shace.directives', []);
angular.module('shace.controllers', ['shace.resources', 'shace.services']);


require('js/app/*');
require('js/controllers/*');
require('js/filters/*');
require('js/resources/*');
require('js/directives/*');
require('js/services/*');