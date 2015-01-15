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

//信息处理
var Message = function (data){
	if(typeof data.type !== "number")
		throw new Error("非法参数");
	var flag = [1,2,3,4,5,6].some(function(num,index){
		if(num == data.type){
			return true;
		}
	});
	this.msg = data.msg.trim();
	flag?this.type = data.type:this.type = 1;
	this.userId = data.userId || "";
}

//发送信息
Message.prototype.sendMessage = 
function(socket,callback,client){
	if(!(this.msg && this.type)){
		callback({state:false,info:"发送信息不可为空"});
		return;
	}
	
	(this.type===2 && this.userId !== "") ?sendPrivate(this,client,socket)
			:sendMessages(this,client,socket);
	
	//发送信息
	function sendMessages(message,client,socket){
		if(message.type==2)
			message.type = 1;
		var memberIdInfo = "member"+socket.userId+"Info";	
		client.HGETALL(memberIdInfo,function(err,userInfo){
			var newMessage = {msg:message.msg,type:message.type,sender:userInfo};
			var newMessageString = JSON.stringify(newMessage);
			socket.broadcast.to(socket.broomId).emit("new message",newMessage);
			var roomIdMessage = "room"+socket.roomId+"MessageType"+message.type;
			client.LLEN(roomIdMessage,function(err,len){
				if(len<=50){
					client.RPUSH(roomIdMessage,newMessageString);
				}else{
					client.RPUSH(roomIdMessage,newMessageString);
					client.LPOP(roomIdMessage);
				}
			});
		});
		callback({state:true,info:"信息发送成功",msg:message.msg,type:message.type});
	}
	
	//发送私信
	function sendPrivate(message,client,socket){
		var roomIdPerson = "room"+socket.roomId+"Person";
		var ToMember = "member"+message.userId+"Info";
		var memberIdInfo = "member"+socket.userId+"Info";
		client.HEXISTS(roomIdPerson,ToMember,function(err,exist){
			var bToMember = "room"+socket.roomId+"user"+message.userId;
			if(exist){
				client.HGETALL(memberIdInfo,function(err,userInfo){
					socket.broadcast.to(bToMember).emit("new message",{msg:message.msg,type:message.type,sender:userInfo});
				});
				callback({state:true,info:"私信发送成功",msg:message.msg,type:message.type});
			}else
				callback({state:false,info:"用户不存在"});
		});
	}
	
	//发送音乐
};

module.exports = Message;