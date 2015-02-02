
var socket;

$(function(){
	socket = io(chatSocketUrl + '/chatRoom').connect();

	//获取get参数数组
	var $_GET = (function(){
		var urlArray = window.document.location.href.toString().split("?");
		if(typeof(urlArray[1])==="string" ){
			var paramsArray = urlArray[1].split("&");
			var get={};
			for(var i in paramsArray){
				if(typeof(paramsArray[i])=="string"){
					var j = paramsArray[i].split("=");
					get[j[0]] = j[1];
				}
			}
			return get;
		}else{
			return {};
		}
	})();

	var userinfo = $.parseJSON($("#info").text());
	//Object.freeze(userinfo);
	//进入房间
	socket.on("connect", function (data) {
		socket.emit("enter room", userinfo, function(data) {
			firstTimeEnter(data);
		});
	});
	//进房间拉信息
	socket.on("get message", function (data) {
		getMessage(data);
	});

	//收到新信息
	socket.on("new message", function (data) {
		newMessage(data);
	});

	//当有新成员加入房间
	socket.on('add new member', function (data) {
		NewGuyEnter(data)
	});

	//有成员离开房间
	socket.on("leave room", function (data) {
		leavingRoom(data)
	});

	//监听返回的错误信息
	socket.on("errorinfo", function (data) {
		socketGetError(data);
		socket.disconnect();
	});

	socket.on("disconnect", function (data) {
		socketDiscon();
	});

	socket.on("reconnecting",function (data) {
		socketRecon();
	});
});
//可能需要用到的代码
//event.preventDefault() 取消事件的默认动作
