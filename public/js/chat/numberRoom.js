
var socket;

$(function() {
	var $newRoomType = $('#newroomtype');
	var roomType = parseInt($newRoomType.val());

	socket = io(chatSocketUrl + '/roomInfo').connect();

	socket.on("enter room",function(data){
		enter(data);
	});

	socket.on("leave room",function(data){
		leave(data);
	});

	socket.on("new room",function(data){
		if (data && data.type == roomType) {
			newroom(data);
		}
	});

});
