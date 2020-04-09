'use strict';
// stand-alone index.js

var logger = require('winston');
var app = require('./app/index');

// Read port from command line, config, or default
var port = (process.argv[2] || (process.env.npm_package_config_port || 3000));

app.listen(port, function () {
  logger.info('Listening on port ' + port +'...');
});
