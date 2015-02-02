
var socket;

$(function() {
	socket = io(chatSocketUrl + '/roomInfo').connect();

	socket.on("enter room",function(data){
		enter(data);
	});

	socket.on("leave room",function(data){
		leave(data);
	});
});
