
var Router = require('koa-router');

var validator = require('validator');

var model = require('./../model'),
  Room = model.Room;

var chat = new Router();

function checkInt(data) {
	if (validator.isNumeric(data) && data != 0)
		return true;
	return false;
}

chat.get('/', function *() {
  var type = parseInt(this.query.type);
  if(!type || !checkInt(type))
    type = 1;
  yield this.render('chat/index', {
    title: 'Dollars_社区_聊天室_MissEvan',
    user: this.user,
    roomType: type
  });
});

chat.get('/ip', function *() {
  this.body = {
    'x-real-ip': this.headers['x-real-ip'],
    'x-forwarded-for': this.headers['x-forwarded-for'],
    'remoteip': this.headers['remoteip'],
    'ip': this.ip
  };
});

chat.get('/room/ticket',function *() {
	if (this.user && this.user.teamid) {
		var roomModel = new Room();
		var ticket = yield roomModel.getTicket(this.user);
    this.body = {
      code: 0,
      ticket: ticket
    };
	} else {
		throw new Error('你没有加入任何小组');
	}
});

chat.get('/room', function *() {
	var roomId;
	var roomName;
	var roomInfo;
	var ticket;
	var roomModel = new Room();
	if (this.query && this.query.roomId) {
		roomId = parseInt(this.query.roomId);
		if(!checkInt(roomId)) throw new Error('该房间不存在');

		roomId = 't' + roomId;
    roomInfo = yield roomModel.checkTempRoom(roomId, this.user);
		if (!roomInfo) {
      throw new Error('你没有资格进入该房间');
    }

    roomName = roomInfo.name;
	} else {
		if (this.user) {
			if(this.query && this.query.ticket){
				ticket = this.query.ticket;
				roomInfo = yield roomModel.checkTicket(ticket);
				roomId = roomInfo.id;
				roomName = roomInfo.name;
			} else {
				if(yield roomModel.checkTeamRoom(this.user)){
					roomId = this.user.teamid;
					roomName = this.user.teamname;
				}
			}
		} else {
			throw new Error('不能进入私人房间');
    }
}

  var title = roomName + '_社区_聊天室_MissEvan';
  yield this.render('chat/room', {
    roomId: roomId,
    title: title,
    user: this.user
  });
});

chat.get('/room/list', function *() {
  var roomModel = new Room();

  var type = parseInt(this.query.type);
  if (!type || !checkInt(type)) {
    type = 1;
  }

  var roomList = yield roomModel.getRoomList(type);
  var r = {
    code: 0,
    roomlist: roomList,
    members: yield roomModel.getMemberInTempRoom(roomList)
  };

  if (this.user && this.user.teamid) {
    var teamRoomId = this.user.teamid.toString();
    //插入小组房间
    r.roomlist.unshift({
      "id": teamRoomId,
      "name": this.user.teamname,
      "type": 0,
      "maxNum": 100,
    });
    //插入小组房间成员
    r.members[teamRoomId] = yield roomModel.getTeamMemberList(this.user);
  }

  this.body = r;
});

chat.post('/room/new', function *() {
	if(!this.user)
		throw new Error('请先登录！');

  var room = this.request.body;

  room.type = parseInt(room.type);
  if (!room.type || !checkInt(room.type))
  	room.type = 1;

  room.maxNum = parseInt(room.maxNum);
  if (!checkInt(room.maxNum))
  	throw new Error('房间人数必须为数字');
  if (room.maxNum<2 || room.maxNum>30)
  	throw new Error('房间人数不能小于2或大于30');

  //check room name
  if (!room.name)
  	throw new Error('房间名不可为空');
  room.name = validator.trim(room.name);
  if (!validator.isLength(room.name, 2, 25))
  	throw new Error('房间名必须有2～25个字');

  var roomModel = new Room();
  var roomInfo = yield roomModel.newRoom(room, this.user);

  this.body = {
    code: 0,
    roominfo: roomInfo
  };
});

module.exports = chat;
