
var http = require('http');

var chat = require('./chat'),
  websocket = require('./websocket');

module.exports = function (app) {
  //先将http请求的中间件加载
  chat(app);

  var server = http.createServer(app.callback()),
    io = require('socket.io')(server);

  //socket.io
  websocket(app, io);

  return server;
};
