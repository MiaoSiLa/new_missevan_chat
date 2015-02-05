
var http = require('http');
var mount = require('koa-mount');

var chat = require('./chat'),
  gekijou = require('./gekijou'),
  websocket = require('./websocket');

module.exports = function (app) {
  //先将http请求的中间件加载
  app.use(mount('/chat', chat.middleware()));
  app.use(mount('/gekijou', gekijou.middleware()));

  var server = http.createServer(app.callback()),
    io = require('socket.io')(server);

  //socket.io
  websocket(app, io);

  return server;
};
