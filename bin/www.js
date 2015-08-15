#!/usr/bin/env iojs

var config = require('./../config');

var koa = require('koa'),
  cache = require('./../lib/cache'),
  middlewares = require('./../lib/middlewares'),
  controller = require('./../controller');

//init cache
cache.init();

var app = koa();
//wrap middlewares & controller
middlewares(app);
var server = controller(app);

process.on('uncaughtException', function (err) {
	console.error(err);
});

//开始监听
server.listen(
  process.env.PORT || config['web'].port || 3000,
  config['web'].address || '::',
  function () {
    console.log('Chat Server running on ' +
    server.address().address +
    ':' + server.address().port
  );
});
