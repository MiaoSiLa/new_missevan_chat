
var socket = io(chatSocketUrl + '/roomInfo').connect();

function enter(data){console.log(data)};
function leave(data){console.log(data)};

$(function() {
	socket.on("enter room",function(data){
		enter(data);
	});

	socket.on("leave room",function(data){
		leave(data);
	});
});
