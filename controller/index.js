
var http = require('http');

var chat = require('./chat'),
  websocket = require('./websocket');

module.exports = function (app) {

  chat(app);

  var server = http.createServer(app.callback()),
    io = require('socket.io')(server);

  websocket(app, io);

  return server;
};
