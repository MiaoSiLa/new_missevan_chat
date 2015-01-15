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

var User = function (data){
	if(data !== undefined){
		this.name = data.name?data.name:"匿名用户";
		this.id = data.id?data.id:0;
		this.icon = data.icon?data.icon:"";
		this.iconColor = data.iconColor?data.iconColor:"";
		this.subTitle = data.subTitle?data.subTitle:"";
	}
}

//进入房间
User.prototype.EnterRoom = 
	function(callback,socket,client,bridge){
		if(this.id !== undefined && this.id !== 0){
			socket.userId = this.id;
			socket.buserId = "room"+socket.roomId+"user"+socket.userId;
			socket.join(socket.buserId);
			
			var roomIdPerson = "room"+socket.roomId+"Person";
			var memberIdInfo = "member"+socket.userId+"Info";
			client.HMSET(memberIdInfo,this);
			var _this = this;
			client.HINCRBY(roomIdPerson,memberIdInfo,1,function(err,num){
				if(num==1){
					socket.broadcast.to(socket.broomId).emit("add new member",_this);
					bridge.emit('enter room',{room:socket.roomId,number:"+1",personInfo:_this});
				}
			});
		}
		
		//获取所有在线人员信息
		client.HKEYS(roomIdPerson,function(err,keys){
			multi = client.multi();
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
	}

//离开房间
User.LeaveRoom =
	function(socket,bridge,client){
		if(socket.userId==undefined){
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
						client.EXPIRE(roomIdInfo,30);
					}
				});
				client.HGETALL(memberIdInfo,function(err,userInfo){
					socket.broadcast.to(socket.broomId).emit("leave room",userInfo);
					bridge.emit('leave room',{room:socket.roomId,number:"-1",personInfo:userInfo});
				});
				client.KEYS("room*Person",function(err,keys){
					multi = client.multi();
					keys.forEach(function(key,index){
						multi.SISMEMBER(key,memberIdInfo);
					});
					multi.exec(function(err,exists){
						if(exists.length === 0){
							client.DEL(memberIdInfo);
						}
					});
				});
			}
		});
	}

module.exports = User;