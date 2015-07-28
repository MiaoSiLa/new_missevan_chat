var ChatBubble;

ChatBubble = (function() {
  function ChatBubble() {
    this._showname = true;
  }

  ChatBubble.prototype.init = function() {
    var $cm;
    this.stage = $('#commentCanvas');
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
    this.background();
  };

  ChatBubble.prototype.xss = function(str) {
    var s1, s2;
    s1 = str.replace(/<img [^>]*?src=(".+?")[^>]*?\/?>/gi, "|img:$1|");
    s2 = moTool.boardReplaceTxt(s1);
    return s2.replace(/\|img\:&quot;(.+?)&quot;\|/gi, "<img src=\"$1\" />");
  };

  ChatBubble.prototype.showname = function(_showname) {
    this._showname = _showname;
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

  ChatBubble.prototype.stateimage = function(url, cb) {
    var img, self;
    self = this;
    img = new Image();
    img.onload = function() {
      var chathtml;
      chathtml = '<li id="chatline' + index.mo.chatLine + '"><div class="chatinfo">' + '<img class="state-image" src=' + JSON.stringify(url) + ' /></div></li>';
      index.mo.chatLine++;
      self.addhtml(chathtml);
      if (cb != null) {
        cb();
      }
    };
    img.src = url;
  };

  ChatBubble.prototype.background = function(data, cb) {
    var img;
    if (data) {
      img = new Image();
      img.onload = function() {
        $('#chatmain').css('background-image', 'url(' + data.url + ')');
        if (cb != null) {
          cb();
        }
      };
      img.src = data.url;
    } else {
      $('#chatmain').css('background-image', 'none');
      if (cb != null) {
        cb();
      }
    }
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
        text = this.xss(data.msg);
        text = text.replace(/\n/g, '<br>');
        chathtml = '<li ';
        if (data.showon === 'right') {
          chathtml += 'class="author" ';
        }
        chathtml += 'id="chatline' + index.mo.chatLine + '">\n' + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n';
        if (this._showname) {
          chathtml += '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n';
        }
        chathtml += '  <div class="userSay">\n' + '    <div class="inlineText">' + text + '</div>\n' + '  </div>\n' + '</li>';
        index.mo.chatLine++;
        this.addhtml(chathtml);
        if (cb != null) {
          cb();
        }
        break;
      case 7:
        img = new Image();
        img.onload = function() {
          var h, imghtml, maxw, w;
          h = this.height;
          w = this.width;
          maxw = 600;
          if (chatBox.isMobile) {
            maxw = 225;
          }
          if (w > maxw) {
            w = maxw;
            h = Math.floor(maxw * this.height / this.width);
          }
          if (h > 600) {
            w = Math.floor(600 * this.width / this.height);
            h = 600;
          }
          imghtml = '<a target="_blank" href="' + data.msg + '">' + '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />' + '</a>';
          chathtml = '<li ';
          if (data.showon === 'right') {
            chathtml += 'class="author" ';
          }
          chathtml += 'id="chatline' + index.mo.chatLine + '">\n' + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n';
          if (self._showname) {
            chathtml += '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n';
          }
          chathtml += '  <div class="userChatImage">' + imghtml + '</div>\n' + '</li>';
          index.mo.chatLine++;
          self.addhtml(chathtml);
          if (cb != null) {
            cb();
          }
        };
        img.src = data.msg;
    }
    play.soundBox.playChat();
  };

  ChatBubble.prototype.tobottom = function() {
    this.stage.clearQueue().stop().animate({
      scrollTop: this.el.height()
    }, 1000);
  };

  ChatBubble.prototype.isbottom = function() {
    var height, stage_height;
    stage_height = this.stage.height();
    height = this.el.height();
    return height - stage_height < this.stage.scrollTop();
  };

  return ChatBubble;

})();
