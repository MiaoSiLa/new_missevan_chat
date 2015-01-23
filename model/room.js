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

	if (data) {
		this.ticket = data.ticket;
		this.roomId = data.roomId.toString();
		this.userId = data.userId ? data.userId : 0;
	}
}

util.inherits(Room, ModelBase);

Room.prototype.isRoom = function () {
	if (this.roomId) {
		return /^t?[0-9]+$/.test(this.roomId);
	}
	return false;
};

Room.prototype.isLastingRoom = function () {
	if (this.roomId) {
		return /^[0-9]+$/.test(this.roomId);
	}
	return false;
};

//进入房间
Room.prototype.enter = function *() {
	var socket = this.socket;
	var yclient = this.yclient;

	if (!this.isRoom()) {
		throw new Error('错误的房间号');
	}

	var lastingRoom = this.isLastingRoom();

	var roomId = this.roomId;
	var memberId = this.userId;

	var roomIdPerson = 'room' + roomId + 'Person';

	socket.roomId = roomId;
	socket.broomId = 'room' + roomId;
	socket.join(socket.broomId);

	if (memberId) {
		var roomIdInfo = 'room' + roomId + 'Info';
		var memberIdInfo = 'member' + memberId + 'Info';

		yield yclient.PERSIST(roomIdInfo);
		yield yclient.PERSIST(memberIdInfo);

		var roomName = yield yclient.HGET(roomIdInfo, 'name');
		if (!roomName) {
			throw new Error('没有找到该房间');
		}
		if (!lastingRoom) {
			yield yclient.SADD('roomNameIndex', roomName);
		}

		if (this.ticket) {
			socket.ticket = this.ticket;
		}

		socket.roomName = roomName;

		socket.userId = memberId;
		socket.buserId = 'room' + this.roomId + 'user' + this.userId;
		socket.join(socket.buserId);

		var num = yield yclient.HINCRBY(roomIdPerson, memberIdInfo, 1);
		if (num == 1) {
			var member = yield yclient.HGETALL(memberIdInfo);
			if (member) {
				socket.broadcast.to(socket.broomId).emit('add new member', member);
				this.bridge.emit('enter room', {
					room: socket.roomId,
					number: '+1',
					personInfo: member
				});
			}
			if (!lastingRoom) {
				yield yclient.ZINCRBY('roomIdIndex', 1, roomId);
			}
		}
	}

	// 获取所有在线人员信息
	var keys = yield yclient.HKEYS(roomIdPerson);
	var multi = yclient.multi();
	for (var i = 0; i < keys.length; i++) {
		multi.HGETALL(keys[i])();
	}
	var userInfos = yield multi.exec();

	return { state: true, member: userInfos };
};

//离开房间
Room.prototype.leave = function *() {
		var socket = this.socket;
		var yclient = this.yclient;

		if (!socket.userId) {
			socket.leave(socket.broomId);
			return;
		}

		var roomIdInfo = "room"+socket.roomId+"Info";
		var roomIdPerson = "room"+socket.roomId+"Person";
		var memberIdInfo = "member"+socket.userId+"Info";

		var num = yield yclient.HINCRBY(roomIdPerson, memberIdInfo, -1);
		if (num <= 0) {
			if (socket.ticket) {
				yield yclient.SETEX('ticket' + socket.ticket, config.redis.time, socket.roomId);
			}

			socket.leave(socket.broomId);
			socket.leave(socket.buserId);
			yield yclient.HDEL(roomIdPerson, memberIdInfo);
			var exist = yield yclient.EXISTS(roomIdPerson);
			if (!exist) {
				yield yclient.SREM('roomNameIndex', socket.roomName);
				if(socket.roomId[0] == 't')
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
				multi.SISMEMBER(keys[i], memberIdInfo)();
			};
			var exists = yield multi.exec();
			if (exists.length === 0) {
				yield yclient.EXPIRE(memberIdInfo, config.redis.time);
			}
		}
};



module.exports = Room;

ModelBase.register('room', Room);
