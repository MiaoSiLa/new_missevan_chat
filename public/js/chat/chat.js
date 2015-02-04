
$(function() {
  index.soundBox.init();
  index.js.loadLeftIcon();
  index.js.loadLeftM();
});

/*========== 聊天室内 ==========*/

//当新人加入时触发
/**
*data json userinfo
*/
function NewGuyEnter(data) {
  chatBox.loadNewMember(data);
};

//是否是第一次进入
/**
*data true or false
*/
function firstTimeEnter(data) {
  //console.log(data.member);
  chatBox.loadNewMembers(data.member);
};

//有人离开
/**
*data json userinfo
*/
function leavingRoom(data) {
  //console.log(data);
  chatBox.loadLeavingMember(data);
};

//发送信息
/**
*message json
type
userId
msg
*callback(json)
state info msg type
*/
function sendMessage(message,callback) {
  //console.log('发送');
  socket.emit('send message',message,callback);
}
//第一次加载消息
function getMessage(data) {
  //console.log(data);
  chatBox.loadFirstMessage(data);
}

//错误信息断开
// 	function socketDisconnect(data){
// 		console.log(data);
// 	};

//收到新信息
function newMessage(data) {
  //console.log('接收');
  //console.log(data);
  chatBox.loadBubble(data);
};

function socketDiscon() {
  console.log("链接断开");
};

function socketRecon() {
  console.log("正在重连");
}

function socketGetError(data) {
  console.error(data);
}

/*========== 聊天室列表 ==========*/

function enter(data) {
  data.personInfo = chatBox.sender(data.personInfo);
  chatBox.loadRoomList(data);
}

function leave(data) {
  data.personInfo = chatBox.sender(data.personInfo);
  chatBox.loadRoomList(data);
}

function newroom(data) {
  chatRoomList.addNewRoom(data, 'begin');
}
