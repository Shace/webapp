'use strict';

var connect = require('connect');
var port = process.env.PORT || 3000;

connect.createServer(
    connect.static('dist')
).listen(port);
