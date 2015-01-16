/**
* @Title: room.js
* @Package model
*
* @author 操杰朋, 腾袭
* @create 2014/12/19
* @update 2015/01/16
* @version 0.1.1
*
* @Description:
*/

var config = require('./../conf.js');

var util = require('util');
var ModelBase = require('./../lib/base');

function Room(data, socket, bridge) {
	this.socket = socket;
	this.bridge = bridge;
}

util.inherits(Room, ModelBase);

//离开房间
Room.prototype.leave = function *() {
		var socket = this.socket;
		var yclient = this.yclient;

		var roomIdInfo = "room"+socket.roomId+"Info";
		var roomIdPerson = "room"+socket.roomId+"Person";
		var memberIdInfo = "member"+socket.userId+"Info";

		var num = yield yclient.HINCRBY(roomIdPerson, memberIdInfo, -1);
		if (num <= 0) {
			socket.leave(socket.broomId);
			socket.leave(socket.buserId);
			yield yclient.HDEL(roomIdPerson, memberIdInfo);
			var exist = yield yclient.EXISTS(roomIdPerson);
			if (!exist) {
				yield yclient.SREM('roomNameIndex', socket.roomName);
				yield yclient.SETEX('rN' + socket.roomName, config.redis.time, true);
				yield yclient.ZREM('roomIdIndex', socket.roomId);
				yield yclient.EXPIRE(roomIdInfo, config.redis.time);
			}

			var userInfo = yield yclient.HGETALL(memberIdInfo);
			socket.broadcast.to(socket.broomId).emit('leave room', userInfo);
			this.bridge.emit('leave room', {
				room: socket.roomId,
				number: "-1",
				personInfo: userInfo
			});

			var keys = yield yclient.KEYS("room*Person");
			var multi = yclient.multi();
			for (var i = 0; i < keys.length; i++) {
				yield multi.SISMEMBER(keys[i], memberIdInfo);
			};
			var exists = yield multi.exec();
			if (exists.length === 0) {
				yield yclient.EXPIRE(memberIdInfo, config.redis.time);
			}
		}
};



module.exports = Room;

ModelBase.register('room', Room);
