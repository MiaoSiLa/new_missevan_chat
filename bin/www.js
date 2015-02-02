#!/usr/bin/env iojs

var config = require('./../config');

var koa = require('koa'),
  middlewares = require('./../lib/middlewares'),
  controller = require('./../controller');

var app = koa();

//wrap middlewares & controller
middlewares(app);
var server = controller(app);

process.on('uncaughtException', function (err) {
	console.error(err);
});

server.listen(
  process.env.PORT || config['web'].port || 3000,
  config['web'].address || '::',
  function () {
    console.log('Chat Server running on ' +
    server.address().address +
    ':' + server.address().port
  );
});
