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

var Room = function (data){
	if(data.id === undefined || data.id === "" ||
		data.name === undefined || data.name === "")
		throw new Error("非法房间");
	this.id = data.id;
	this.name = data.name;
}

//进入房间
Room.prototype.SbEnterRoom = 
	function(socket,client){
		socket.roomId = this.id;
		socket.broomId = "room"+this.id;
		socket.join(socket.broomId);
		var roomIdInfo = "room"+this.id+"Info";
		client.HMSET(roomIdInfo,this,function(err,value){
			client.PERSIST(roomIdInfo);
		});
	}	

module.exports = Room;