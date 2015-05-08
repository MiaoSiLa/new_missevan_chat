var ChatBubble;

ChatBubble = (function() {
  function ChatBubble() {}

  ChatBubble.prototype.init = function() {
    var $cm;
    $cm = $('#chatmain .container');
    $cm.prepend('<div id="chatbubble"><ul id="chat"></ul></div>');
    this.el = $cm.find('#chat');
    if (chatBox.isMobile) {
      moTool.boardReplaceTxt = GG.util.escape;
      index.mo.chatLine = 1;
      $cm.find('#chatbubble').css('width', '100%');
    }
  };

  ChatBubble.prototype.reset = function() {
    this.el.html('');
  };

  ChatBubble.prototype.addhtml = function(html) {
    this.el.append(html);
    $('#chatmain').animate({
      scrollTop: this.el.height()
    }, 200);
  };

  ChatBubble.prototype.text = function(str) {
    var chathtml, text;
    text = moTool.boardReplaceTxt(str);
    chathtml = '<li id="chatline' + index.mo.chatLine + '"><div class="chatinfo"><span>' + text + '</span></div></li>';
    index.mo.chatLine++;
    this.addhtml(chathtml);
  };

  ChatBubble.prototype.popup = function(data, cb) {
    var chathtml, colorlist, iconColor, img, self, subTitle, subTitleColor, text, userName, userNameColor, userNameHtml;
    self = this;
    subTitle = '';
    iconColor = data.sender.iconColor != null ? data.sender.iconColor : '#91c0edm#cde1edm#709cc9m#5079c9m#709cc9';
    colorlist = iconColor.split('m');
    if (data.sender.subTitle) {
      subTitleColor = colorlist[0] === '#000000' ? "#A3A3A3" : colorlist[0];
      subTitle = "<span style='color:" + subTitleColor + ";'>" + moTool.boardReplaceTxt(data.sender.subTitle) + '</span>';
    }
    userNameColor = index.mo.bgType === 1 ? '#ffffff' : '#000000';
    userName = data.sender.name;
    userNameHtml = moTool.boardReplaceTxt(userName);
    if (subTitle) {
      userNameHtml += ' (' + subTitle + ')';
    }
    switch (data.type) {
      case 1:
        text = moTool.boardReplaceTxt(data.msg);
        text = text.replace(/\n/g, '<br>');
        chathtml = '<li id="chatline' + index.mo.chatLine + '">\n' + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n' + '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n' + '  <div class="userSay">\n' + '    <div class="inlineText">' + text + '</div>\n' + '  </div>\n' + '</li>';
        index.mo.chatLine++;
        this.addhtml(chathtml);
        if (cb != null) {
          cb();
        }
        break;
      case 7:
        img = new Image();
        img.onload = function() {
          var h, imghtml, w;
          h = this.height;
          w = this.width;
          if (w > 600) {
            w = 600;
            h = Math.floor(600 * this.height / this.width);
          }
          if (h > 600) {
            w = Math.floor(600 * this.width / this.height);
            h = 600;
          }
          imghtml = '<a target="_blank" href="' + data.msg + '">' + '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />' + '</a>';
          chathtml = '<li id="chatline' + index.mo.chatLine + '">\n' + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n' + '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n' + '  <div class="userChatImage">' + imghtml + '</div>\n' + '</li>';
          index.mo.chatLine++;
          self.addhtml(chathtml);
          if (cb != null) {
            cb();
          }
        };
        img.src = data.msg;
    }
    index.soundBox.playChat();
  };

  return ChatBubble;

})();
