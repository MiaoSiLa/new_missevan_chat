/**
 * @Title: message.js
 * @Package model
 *
 * @author 操杰朋, 腾袭
 * @create 2014/12/19
 * @update 2015/01/16
 * @version 0.1.1
 *
 * @Description:
 */
"use strict";

var util = require('util'),
	_ = require('underscore'),
	validator = require('validator');
var ModelBase = require('./../lib/base');
var ObjectID = require('mongodb').ObjectID;

var Room = require('./room');

// 信息处理
function Message(data, socket) {
	ModelBase.call(this);

	this.socket = socket;
	if (!data) {
		return;
	}

	this.type = data.type;
	this.msg = data.msg;

	this.userId = data.userId || 0;
}

util.inherits(Message, ModelBase);

Message.prototype.getRecent = function *() {
	var socket = this.socket;
	var yclient = this.yclient;

	// 获取在线的message
	var msgTypes = [1, 3, 4, 7];
	var yds = [];
	for (var i = 0; i < msgTypes.length; i++) {
		var num = msgTypes[i];
		var roomIdMessage = 'room' + socket.roomId + 'MessageType' + num;
		yds.push(yclient.LRANGE(roomIdMessage, 0, -1));
	}

	var datas = yield yds;
	var messages = [];
	for (var i = 0; i < datas.length; i++) {
		var data = datas[i];
		for (var j = 0; j < data.length; j++) {
			messages.push(JSON.parse(data[j]));
		}
	}

	messages = _.sortBy(messages, _.iteratee('time'));
	socket.emit('get message',{ state: true, msg: messages });
};

Message.prototype.getHistory = function *() {
	var q = {};
	if (this.userId) {
		q.userId = this.userId;
	} else {
		q.roomId = this.socket.roomId;
	}
	return yield this.getAll(q);
};

// 发送信息
Message.prototype.sendRoomMessage = function *() {
	var socket = this.socket;
	var memberIdInfo = "member" + socket.userId + "Info";
	var userInfo = yield this.yclient.HGETALL(memberIdInfo);
	if (!userInfo) {
		throw new Error('没有找到发信者');
	}

	userInfo = Room.MemberInfo(userInfo);
	var newMessage = {
		msg : this.msg,
		type : this.type,
		sender : userInfo,
		time: new Date().valueOf()
	};

	var newMessageString = JSON.stringify(newMessage);
	socket.broadcast.to(socket.broomId).emit("new message", newMessage);

	//将图片类型存在公聊类型，防止50条消息冲突
	var saveType = (this.type == 7) ? 1 : this.type;
	var roomIdMessage = "room" + socket.roomId + "MessageType" + saveType;
	var len = yield this.yclient.LLEN(roomIdMessage);
	if (len <= 50) {
		yield this.yclient.RPUSH(roomIdMessage, newMessageString);
	} else {
		yield this.yclient.RPUSH(roomIdMessage, newMessageString);
		yield this.yclient.LPOP(roomIdMessage);
  }

	newMessage.userId = socket.userId;
	newMessage.roomId = socket.roomId;

	yield this.collection.save(newMessage);

	return {
		state : true,
		info : "信息发送成功",
		msg : this.msg,
		type : this.type
	};
};

// 发送私信
Message.prototype.sendPrivate = function *() {
	var socket = this.socket;
	var roomIdPerson = "room" + socket.roomId + "Person";
	var memberIdInfo = "member" + socket.userId + "Info";

	var exist = yield this.yclient.ZSCORE(roomIdPerson, this.userId);
	var bToMember = "room" + socket.roomId + "user" + this.userId;
	if (exist) {
		var userInfo = yield this.yclient.HGETALL(memberIdInfo);
		if (!userInfo) {
			throw new Error('没有找到发信者');
		}

		userInfo = Room.MemberInfo(userInfo);

		var newMessage = {
			msg : this.msg,
			type : this.type,
			sender : userInfo,
			time: new Date().valueOf(),
			touser: this.userId
		};

		socket.broadcast.to(bToMember).emit("new message", newMessage);

		yield this.collection.save(newMessage);

		return {
			state : true,
			info : "私信发送成功",
			msg : this.msg,
			type : this.type
		};
	}
	return {
		state : false,
		info : "用户不存在"
	};
};

// 发送音乐

// 发送信息
Message.prototype.sendMessage = function *() {
	if (!(this.msg && this.type)) {
		return {
			state : false,
			info : "发送信息不可为空"
		};
	}

	if ((this.type === 2 || this.type === 8) && this.userId) {
		return yield this.sendPrivate();
	} else {
		return yield this.sendRoomMessage();
	}
};

module.exports = Message;

ModelBase.register('message', Message);
