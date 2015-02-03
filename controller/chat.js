
var mount = require('koa-mount');

var Router = require('koa-router');

var validator = require('validator');

var chat = new Router();

function checkInt(data){
	if(validator.isNumeric(data) && data!=0)
		return true;
	return false;
}

module.exports = function (app) {

  chat.get('/', function *() {
    yield this.render('chat/index', {
      title: 'Dollars_社区_聊天室_MissEvan',
      user: this.user
    });
  });

  chat.get('/room', function *() {
	var roomId;
	var roomName;
	var roomInfo;
	var ticket;
	var roomModel = new Room();
	if(this.query && this.query.roomId){
		roomId = this.query.roomId;
		if(!checkInt(roomId)) throw new Error('该房间不存在');
		roomId = 't'+roomId;
		if(!roomModel.checkTempRoom(roomId,this.user))
			throw new Error('你没有资格进入该房间');
	}else{
		if(this.user){
			if(this.query,this.query.ticket){
				ticket = this.query.ticket;
				roomInfo = roomModel.checkTicket();
				roomId = roomInfo.id;
				roomName = roomInfo.name;
			}else{
				if(roomModel.checkTeamRoom(this.user)){
					roomId = this.user.teamid;
					roomName = this.user.teamname;
				}
			}
		}else
			throw new Error('不能进入私人房间');
	}
	
	
    var title = roomName+'_社区_聊天室_MissEvan';
    yield this.render('chat/room', {
      roomId: roomId,
      title: title,
      user: this.user
    });
  });

  chat.post('/newroom', function *() {
	if(!this.user)
		throw new Error('需要登录后执行！');
    var room = this.request.body;
    if(!checkInt(room.type))
    	room.type = 1;
    if(!checkInt(room.maxNum))
    	throw new Error('房间人数为数字');
    if(room.maxNum<2 || room.maxNum>30)
    	throw new Error('房间人数不能小于2或大于30');
    if(!room.name)
    	throw new Error('房间名不可为空');
    room.name = validator.trim(room.name);
    if(!validator.isLength(room.name,2,25))
    	throw new Error('房间名必须有2～25个字');
    
    var roomModel = new Room();
    var roomInfo = roomModel.newRoom(room, this.user);
    roomInfo.id = roomInfo.id.replace('t', '');
    this.body = roomInfo;
  });

  app.use(mount('/chat', chat.middleware()));
};
