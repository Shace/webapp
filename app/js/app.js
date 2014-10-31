'use strict';

// Declare app level module which depends on external plugins and internal modules
angular.module('shace', [
    'ngCookies',
    'ngResource',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ngTagsInput',
    'pascalprecht.translate',   
    'duScroll',
    'shace.filters',
    'shace.resources',
    'shace.services',
    'shace.directives',
    'shace.controllers',
    'viewhead'
]);

angular.module('shace.filters', []);
angular.module('shace.resources', []);
angular.module('shace.services', ['shace.resources']);
angular.module('shace.directives', []);
angular.module('shace.controllers', ['shace.resources', 'shace.services']);

require('js/App/*');
require('js/Resources/*');
require('js/Filters/*');
require('js/Directives/*');
require('js/Services/*');
require('js/Controllers/*');
