
var mount = require('koa-mount');

var Router = require('koa-router');

var validator = require('validator');

var model = require('./../model'),
  Room = model.Room;

var chat = new Router();

function checkInt(data){
	if (validator.isNumeric(data) && data != 0)
		return true;
	return false;
}

module.exports = function (app) {

  chat.get('/', function *() {
    var type = this.query.type;
    if(!type || !checkInt(type))
      type = 1;
    yield this.render('chat/index', {
      title: 'Dollars_社区_聊天室_MissEvan',
      user: this.user,
      roomType: type
    });
  });

  chat.get('/room', function *() {
  	var roomId;
  	var roomName;
  	var roomInfo;
  	var ticket;
  	var roomModel = new Room();
  	if (this.query && this.query.roomId) {
  		roomId = this.query.roomId;
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

  chat.get('/roomlist', function *() {
    var roomModel = new Room();

    var type = this.query.type;
    if (!type || !checkInt(type)) {
      type = 1;
    }

    var roomList = yield roomModel.getRoomList(type);
    var r = {
      roomlist: roomList,
      members: yield roomModel.getMemberInTempRoom(roomList)
    };

    if (this.user && this.user.teamid) {
      r.members[this.user.teamid] = yield roomModel.getTeamMemberList(this.user);
    }

    this.body = r;
  });

  chat.post('/newroom', function *() {
  	if(!this.user)
  		throw new Error('请先登录！');

    var room = this.request.body;
    if(!room.type ||　!checkInt(room.type))
    	room.type = 1;
    if(!checkInt(room.maxNum))
    	throw new Error('房间人数为数字');
    if(room.maxNum<2 || room.maxNum>30)
    	throw new Error('房间人数不能小于2或大于30');
    if(!room.roomName)
    	throw new Error('房间名不可为空');

    // to room.name
    room.name = validator.trim(room.roomName);
    if(!validator.isLength(room.name,2,25))
    	throw new Error('房间名必须有2～25个字');

    var roomModel = new Room();
    var roomInfo = yield roomModel.newRoom(room, this.user);
    roomInfo.id = parseInt(roomInfo.id.replace('t', ''));

    this.body = roomInfo;
  });

  app.use(mount('/chat', chat.middleware()));
};
