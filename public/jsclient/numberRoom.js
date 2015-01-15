var socket = io('http://192.168.1.108:3000').connect();
//var socket = io('http://115.29.235.9:3000').connect();

function changeNum(data){console.log(data)};
function getNum(data){console.log(data)};

$(function(){
	
	//获取房间人数
	socket.emit('room number',getNum(data));
	
	//房间人数发生变动
	socket.on('change room number',changeNum(data));
});
