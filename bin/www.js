var express = require('express');

//添加model
var config = require('./../conf.js'),
	Message = require('../model/message.js'),
	User = require('../model/user.js'),
	Bridge = require('../model/bridge.js');

var app = express(),
	bridge = new Bridge();

var server = app.listen(config.port, function() {
  console.log('Express server listening on port ' + server.address().port);
});

//  var io = require('socket.io')();
//  io.origins("http://www.missevan.cn");
//  io.serveClient(false);
//  io.attach(server);


var io = require('socket.io')(server),
	redis = require("redis"),
	socket_redis = require('socket.io-redis');


if (config.dev_mode) {
	//redis没有密码的情况
	var client = redis.createClient(config.redis.port,config.redis.url);
	io.adapter(socket_redis({ host: config.redis.url, port: config.redis.port }));
} else {
	//redis有密码的情况
	var client = redis.createClient(config.redis.port,config.redis.url,{auth_pass:config.redis.password});
	var pub = redis.createClient(config.redis.port, config.redis.url, {auth_pass:config.redis.password});
	var sub = redis.createClient(config.redis.port, config.redis.url, {detect_buffers: true, auth_pass:config.redis.password} );
	io.adapter( socket_redis({pubClient: pub, subClient: sub}) );
}

//client连接错误
client.on("error", function (err) {
	if (config.dev_mode) {
    console.error("Error " + err);
	}
});

var chatRoom = io.of('/chatRoom');
chatRoom.on('connection',function(socket){
	//进入房间
	socket.on("enter room",function(info,callback){
		try{
			if(!((typeof(callback)==='function') || (typeof(info)==='object')))
				throw new Error("非法参数");
			//创建房间
			var roomId = info.roomId;
			console.log(info.roomId);
			var memberId = info.userId;

			var roomIdInfo = 'room' + roomId + 'Info';
			var memberIdInfo = 'member' + memberId + 'Info';
			var roomIdPerson = 'room' + roomId + 'Person';

			client.PERSIST(roomIdInfo);
			client.PERSIST(memberIdInfo);
			client.HGET(roomIdInfo,'name',function(err,roomName){
				client.SADD("roomNameIndex",roomName);
				socket.roomName = roomName;
			});

			socket.roomId = roomId;
			socket.broomId = "room"+roomId;
			socket.join(socket.broomId);

			socket.userId = memberId;
			socket.buserId = "room"+socket.roomId+"user"+socket.userId;
			socket.join(socket.buserId);

			client.HINCRBY(roomIdPerson,memberIdInfo,1,function(err,num){
				if(num==1){
					client.HGETALL(memberIdInfo,function(err,member){
						socket.broadcast.to(socket.broomId).emit("add new member",member);
						bridge.emit('enter room',{room:socket.roomId,number:"+1",personInfo:member});
					});
					client.ZINCRBY('roomIdIndex',1,roomId);
				}
			});

			//获取所有在线人员信息
			client.HKEYS(roomIdPerson,function(err,keys){
				var multi = client.multi();
				keys.forEach(function(key,index){
					multi.HGETALL(key);
				});
				multi.exec(function(err,userInfos){
					callback({state:true,member:userInfos});
				});
			});

			//获取在线的message
			[1,3,4].forEach(function(num,index){
				var roomIdMessage = "room"+socket.roomId+"MessageType"+num;
				client.LRANGE(roomIdMessage,0,-1,function(err,data){
					var messages = [];
					data.forEach(function(message,index){
						messages.push(JSON.parse(message));
					});
					socket.emit("get message",{state:true,msg:messages,type:num});
				});
			});
		}catch(e){
			socket.emit("errorinfo",e.message);
		}
	});

	//断开连接
	socket.on("leaving",function(){
		try{
			User.LeaveRoom(socket,bridge,client);
		}catch(e){
			socket.emit("errorinfo",e.message);
		}
	});

	//离开房间
	socket.on("disconnect",function(){
		try{
			User.LeaveRoom(socket,bridge,client);
		}catch(e){
			socket.emit("errorinfo",e.message);
		}
	});

	//发送信息
	socket.on("send message",function(data,callback){
		try{
			if((typeof(callback)!=="function"))
				throw new Error("非法参数");
			if(!socket.userId)
				return;

			var message = new Message(data);
			message.sendMessage(socket,callback,client);
		}catch(e){
			socket.emit("errorinfo",e.message);
		}
	});

});

var roomInfo = io.of('/roomInfo');

bridge.on('enter room',function(data){
	roomInfo.emit('enter room',data);
});

bridge.on('leave room',function(data){
	roomInfo.emit('leave room',data);
});

function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}

process.on('uncaughtException',function(err){
	console.error(err);
});
