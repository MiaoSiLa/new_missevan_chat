var express = require('express');

// 添加model
var config = require('./../conf.js'),
  Model = require('./../model'),
	Message = Model.Message,
	Room = Model.Room,
	Bridge = Model.Bridge;

var ioMiddleware = require('./../lib/iomiddleware'),
  yclient = require('./../lib/yclient');

var app = express(),
	bridge = new Bridge();

var server = app.listen(config.port, function () {
  console.log('Express server listening on port ' + server.address().port);
});

Model.Base.addParam('yclient', yclient.yclient);

var io = require('socket.io')(server);

io.adapter(yclient.adapter);

var roomInfo = io.of('/roomInfo');
var chatRoom = io.of('/chatRoom');

function *connection() {
  var socket = this.socket;

  // 进入房间
  socket.yon("enter room", function *(data, callback) {
    if ((typeof(callback) !== 'function') || (typeof(data) !== 'object')) {
      throw new Error("非法参数");
    }

    var room = new Room(data, this.socket, bridge);
    var r = yield room.enter();
    callback(r);

    var message = new Message(null, this.socket);
    yield message.getRecent();
  });

  /* deprecate
  // 断开连接
  socket.yon("leaving", function *(){
	  var room = new Room(null, this.socket, bridge);
	  yield room.leave();
  });
  */

  // 离开房间
  socket.yon("disconnect", function *() {
    var room = new Room(null, this.socket, bridge);
    yield room.leave();
  });

  socket.yon("get history", function *(data, callback) {
    if (typeof(callback) !== 'function' || typeof(data) !== 'object')
      throw new Error("非法参数");

    var socket = this.socket;
    if (!socket.userId)
      return;

    if (data.userId && typeof data.userId !== 'number')
      throw new Error("非法参数");

    // set data.userId to get private message
    var message = new Message(data, socket);
    var r = yield message.getHistory();
    callback(r);
  });

  // 发送信息
  socket.yon("send message", function *(data, callback) {
    if (typeof(callback) !== 'function' || typeof(data) !== 'object')
      throw new Error("非法参数");

    var socket = this.socket;
    if (!socket.userId)
      return;

    if (typeof data.type !== 'number'
      || (data.userId && typeof data.userId !== 'number'))
      throw new Error("非法参数");

    data.msg = data.msg.trim();

    var flag = [ 1, 2, 3, 4, 5, 6 ].indexOf(data.type);
    if (flag !== -1) {
      data.type = data.type;
      if (!data.userId && data.type == 2) {
        data.type = 1;
      }
    } else {
      data.type = 1;
    }

    var message = new Message(data, socket);
    var r = yield message.sendMessage();
    callback(r);
  });
}

chatRoom.on('connection', ioMiddleware(connection));

bridge.on('enter room', function(data){
	roomInfo.emit('enter room', data);
});

bridge.on('leave room', function(data){
	roomInfo.emit('leave room', data);
});

process.on('uncaughtException', function (err) {
	console.error(err);
});
