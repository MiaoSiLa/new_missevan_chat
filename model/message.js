/**
 * @Title: message.js
 * @Package model
 * 
 * @author 操杰朋, tengattack
 * @create 2014/12/19
 * @version 0.0.1
 * 
 * @Description:
 */
"use strict";

var util = require('util'), _ = require('underscore'), validator = require('validator');
var ModelBase = require('./../lib/base');
var ObjectID = require('mongodb').ObjectID;

// 信息处理
var Message = function(data) {
	ModelBase.call(this);

	if (!data) {
		return;
	}

	if (typeof data.type !== "number")
		throw new Error("非法参数");

	this.msg = data.msg.trim();

	var flag = [ 1, 2, 3, 4, 5, 6 ].indexOf(data.type);
	if (flag !== -1) {
		this.type = data.type;
	} else {
		this.type = 1;
	}

	this.userId = data.userId || "";
}

util.inherits(Message, ModelBase);

// 发送信息
Message.prototype.sendMessages = function *(socket) {
	if (this.type == 2)
		this.type = 1;
	var memberIdInfo = "member" + socket.userId + "Info";
	var userInfo = yield this.yclient.HGETALL(memberIdInfo);
	var newMessage = {
		msg : this.msg,
		type : this.type,
		sender : userInfo,
		time: new Date().valueOf()
	};

	var newMessageString = JSON.stringify(newMessage);
	socket.broadcast.to(socket.broomId).emit("new message", newMessage);

	var roomIdMessage = "room" + socket.roomId + "MessageType" + this.type;
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
Message.prototype.sendPrivate = function *(socket) {
	var roomIdPerson = "room" + socket.roomId + "Person";
	var ToMember = "member" + message.userId + "Info";
	var memberIdInfo = "member" + socket.userId + "Info";

	var exist = yield this.yclient.HEXISTS(roomIdPerson, ToMember);
	var bToMember = "room" + socket.roomId + "user" + this.userId;
	if (exist) {
		var userInfo = yield this.yclient.HGETALL(memberIdInfo);
		socket.broadcast.to(bToMember).emit("new message", {
			msg : this.msg,
			type : this.type,
			sender : userInfo
		});
		return {
			state : true,
			info : "私信发送成功",
			msg : this.msg,
			type : this.type
		};
	} else {
		return {
			state : false,
			info : "用户不存在"
		};
	}
};

// 发送音乐

// 发送信息
Message.prototype.sendMessage = function *(socket) {
	if (!(this.msg && this.type)) {
		return {
			state : false,
			info : "发送信息不可为空"
		};
	}

	if (this.type === 2 && this.userId !== "") {
		return yield this.sendPrivate(socket);
	} else {
		return yield this.sendMessages(socket);
	}
};

module.exports = Message;

ModelBase.register('message', Message);