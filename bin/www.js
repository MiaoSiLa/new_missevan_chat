#!/usr/bin/env iojs

var config = require('./../config');

var koa = require('koa'),
  middlewares = require('./../lib/middlewares'),
  controller = require('./../controller');

var app = koa();

//wrap middlewares & controller
middlewares(app);
controller.chat(app);

var server = require('http').createServer(app.callback()),
  io = require('socket.io')(server);

//websocket
controller.websocket(io);

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
