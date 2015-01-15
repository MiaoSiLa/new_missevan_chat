var express = require('express');
var app = express();
var http = require('http').Server(app);


var server = app.listen(3000, function(){
  console.log('listening on *:3000');
});

var io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on("newUrl",function(url){
	  console.log("hello");
	  socket.emit("newUrl",url);
  });
  
});