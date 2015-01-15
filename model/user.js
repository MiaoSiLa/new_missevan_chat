/**   
* @Title: message.js
* @Package model
* 
* @author 操杰朋 
* @create 2014/12/19
* @version 0.0.1 
* 
* @Description:
*/

var User = {};
var config = require('../bin/conf.js');

//离开房间
User.LeaveRoom =
	function(socket,bridge,client){
		if(!socket.userId){
			return;
		}
		var roomIdInfo = "room"+socket.roomId+"Info";
		var roomIdPerson = "room"+socket.roomId+"Person";
		var memberIdInfo = "member"+socket.userId+"Info";
		
		client.HINCRBY(roomIdPerson,memberIdInfo,-1,function(err,num){
			if(num<=0){
				socket.leave(socket.broomId);
				socket.leave(socket.buserId);
				client.HDEL(roomIdPerson,memberIdInfo);
				client.EXISTS(roomIdPerson,function(err,exist){
					if(!exist){
						client.SREM('roomNameIndex',socket.roomName);
						client.SETEX(socket.roomName,config.redis.time,true);
						client.ZREM('roomIdIndex',socket.roomId);
						client.EXPIRE(roomIdInfo,config.redis.time);
					}
				});
				client.HGETALL(memberIdInfo,function(err,userInfo){
					socket.broadcast.to(socket.broomId).emit("leave room",userInfo);
					bridge.emit('leave room',{room:socket.roomId,number:"-1",personInfo:userInfo});
				});
				client.KEYS("room*Person",function(err,keys){
					var multi = client.multi();
					keys.forEach(function(key,index){
						multi.SISMEMBER(key,memberIdInfo);
					});
					multi.exec(function(err,exists){
						if(exists.length === 0){
							client.EXPIRE(memberIdInfo,config.redis.time);
						}
					});
				});
			}
		});
	}

module.exports = User;