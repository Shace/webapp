'use strict';

var connect = require('connect');

connect.createServer(
    connect.static('app'),
    connect.static('.tmp')
).listen(8080);
