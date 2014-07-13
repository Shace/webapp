'use strict';

// Declare app level module which depends on filters, and services
angular.module('shace', [
    'ngCookies',
    'ngResource',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'shace.filters',
    'shace.resources',
    'shace.services',
    'shace.directives',
    'shace.controllers',
    'ngTagsInput'
]);

angular.module('shace.filters', []);
angular.module('shace.resources', ['ngResource']);
angular.module('shace.services', ['ngCookies', 'shace.resources']);
angular.module('shace.directives', ['shace.services']);
angular.module('shace.controllers', ['shace.services', 'shace.resources']);

require('js/directives/*');
require('js/controllers/*');
require('js/filters/*');
require('js/resources/*');
require('js/services/*');
require('js/root');