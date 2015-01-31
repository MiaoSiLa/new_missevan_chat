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
	var memberIdInfo = 'member' + memberId + 'Info';
	if (memberId) {
		var exist = yield yclient.EXISTS(memberIdInfo);
		if (!exist) {
			memberId = 0;
		}
	}
	
	var roomIdPerson = 'room' + roomId + 'Person';

	socket.roomId = roomId;
	socket.broomId = 'room' + roomId;
	socket.join(socket.broomId);

	if (memberId) {
		var roomIdInfo = 'room' + roomId + 'Info';
		var roomIdType = 'room'+roomId+'Type';
		yield yclient.PERSIST(roomIdInfo);
		yield yclient.PERSIST(memberIdInfo);
		yield yclient.PERSIST(roomIdType);
		var roomName = yield yclient.HGET(roomIdInfo, 'name');
		if (!roomName) {
			throw new Error('没有找到该房间');
		}
		if (!lastingRoom) {
			var TypeNum = yield yclient.GET(roomIdType);
			yield yclient.SADD('roomNameIndex'+TypeNum, roomName);
		}

		if (this.ticket) {
			socket.ticket = this.ticket;
		}

		socket.roomName = roomName;

		socket.userId = memberId;
		socket.buserId = 'room' + roomId + 'user' + memberId;
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
				var TypeNum = yield yclient.GET(roomIdType);
				yield yclient.ZINCRBY('roomIdIndex'+TypeNum, 1, roomId);
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
				if(socket.roomId[0] == 't'){
					var TypeNum = yield yclient.GET('room'+socket.roomId+'Type');
					yield yclient.SREM('roomNameIndex'.TypeNum, socket.roomName);
					yield yclient.SETEX('rN'+socket.roomName+TypeNum, config.redis.time, socket.roomId);
					yield yclient.ZREM('roomIdIndex'+TypeNum, socket.roomId);
					yield yclient.EXPIRE('room'+socket.roomId+'Type',config.redis.time);
				}
				yield yclient.EXPIRE(roomIdInfo, config.redis.time);
				var messages = [];
				[1,3,4].forEach(function(value){
					var roomIdMessage = 'room' + socket.roomId + 'MessageType' +value;
					messages.push(yclient.EXPIRE(roomIdMessage, config.redis.time));
				});
				yield messages;
			}
			
			//yield yclient.HINCRBY(roomIdPerson, memberIdInfo, -1);
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
