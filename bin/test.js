var config = require('./../config');
var Server = require('socket.io');
var io = new Server();

// var io = require('socket.io')();
// io.origins("http://localhost");
// io.origins("http://www.missevan.cn");
// io.serveClient(false);
// io.attach(server);

io.serveClient(false);
io.attach(config.port);

io.on('connection',function(socket){
	console.log("connect");

	socket.emit("data1","test");

	socket.on("test",function(data){
		console.log("data");
		socket.emit("data","data:"+data);
	});

	socket.on("disconnect",function(){
		console.log("disconnect");
	});
});
