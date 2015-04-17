var chatBox = {
  loadChatOption: function() {
    index.mo.soundEffect = store.get('音效')?store.get('音效'):index.mo.soundEffect;
    index.mo.bubbleType = store.get('气泡')?store.get('气泡'):index.mo.bubbleType;
    index.mo.bgType = store.get('背景')?store.get('背景'):index.mo.bgType;

  },

  loadChatBox: function() {
    var $chatBoxOuterId = $('#chatboxouter'),
    $inputBoxTextareaId = $('#inputboxtextarea'),
    $inputBoxTextareaPostBtnId = $('#inputboxtextareapostbtn'),
    $soundMusicId = $('#soundmusic'),
    $chatMusicId = $('#chatmusic');

    //固定初始高度
    //$chatBoxOuterId.css("height",$(window).height() - 120 + "px");
    //随窗口变化调整chatbox
    //$(window).resize(function() {
    //$chatBoxOuterId.css("height",$(window).height() - 120 + "px");
    //});

    $soundMusicId.click(function() {
      $chatMusicId.fadeToggle(500);
    });

    //公聊输入框
    $inputBoxTextareaId.keypress(function(event) {
      if (event.which != 13) {
        if (this.value.length >= index.mo.maxLength) {
          event.preventDefault();
        }
      } else if(event.which == 13) {
        event.preventDefault();
        $inputBoxTextareaPostBtnId.click();
      }
    });
    //按下公聊POST按钮
    $inputBoxTextareaPostBtnId.click(function(event) {
      if($inputBoxTextareaId.val() == '') return;
      $inputBoxTextareaId.val($inputBoxTextareaId.val().substring(0, index.mo.maxLength));

      var msg = $inputBoxTextareaId.val(),data;
      if(data = chatBox.checkCmd({msg:msg, type:1})) {
        sendMessage(data, function() {
          chatBox.loadBubble({
            msg:data.msg,
            type:data.type,
            sender:index.mo.sender
          });
        });
      }

      $inputBoxTextareaId.val('');
    });
  },

  sender: function(user, small) {
    var iconUrlPrefix = (small ? 'http://static.missevan.cn/mimagesmini/' : 'http://static.missevan.cn/mimages/');
    return {
      id: user.id,
      name: user.username,
      iconColor: user.iconcolor,
      icon: iconUrlPrefix + user.iconurl,
      subTitle: user.subtitle || ''
    };
  },

  loadUser: function() {
    var suser = $("#user").data('user');
    if(!suser) return;

    var user;
    if (typeof suser === 'string') {
      user = $.parseJSON(suser);
    } else if (typeof suser === 'object') {
      user = suser;
    }

    if (user) {
      index.mo.sender = chatBox.sender(user);
    }
  },

  delChats: function() {
    var $chatBoxId = $('#chatbox');

    if(index.mo.chatLine%10 == 0 && index.mo.chatLine > 50 && index.mo.delLine != index.mo.chatLine) {
      index.mo.delLine = index.mo.chatLine;
      $chatBoxId.find('.clear').eq(100).nextAll().remove();
    }
  },

  checkSound: function(messageValue) {
    var $chatSoundClass = $('.chatsound'),
    soundUrl = '';

    $chatSoundClass.each(function(n) {
      if(messageValue.indexOf($(this).find('.chatsoundstr').html()) != -1) {
        soundUrl = $(this).data('soundurl');
        return false;
      }
    });

    return soundUrl;
  },

  loadFirstMessage: function(data) {
    if(index.mo.firstLoad == 1) return;

    if(data.msg.length > 0) {
      var rload = function (i) {
        if (i >= data.msg.length) {
          return;
        }
        var message = data.msg[i];
        chatBox.loadBubble({
          msg: message.msg,
          type: message.type,
          sender: chatBox.sender(message.sender)
        }, function () {
          rload(i + 1);
        });
      };
      rload(0);
    }

    index.mo.firstLoad = 1;
  },

  addInfo: function(infoType, infoMessage) {
    var $infoBoxId = $('#infobox');

    var $infoList = $('<div class="infolist" style="display:none;"><div class="infol"><img src="http://static.missevan.cn/mimages/201501/16/389141afe72a20bff448c230d1c93342202121.png" /></div><div class="infor"><div class="infotype">' + infoType + '</div><div class="infostr">' + infoMessage + '</div></div><div class="clear"></div></div><div class="clear"></div>');
    $infoList.prependTo($infoBoxId);
    $infoList.fadeIn(1000, function() {
      setTimeout(function() {
        $infoList.fadeOut(500, function() {
          $(this).remove();
        });
      },8000);
    });
  },

  addSound: function(message, sender) {
    if(!$('#sound' + message.id).length) {
      var $music = $('<div id="sound' + message.id + '" class="chatmusic"><img title="标题: ' + message.soundstr + '&#10;UP主: ' + message.username + '&#10;声音ID: ' + message.id + '&#10;分享者: ' + sender.name + '" src="' + message.front_cover + '" /></div>');
      $music.prependTo($('#chatmusic'));
      $music.click(function() {
        index.soundBox.playChatMusic(message.soundurl, $(this), index.mo.soundPath);
      });
    }
  },

  checkCmd: function(data) {
    function getNumFromString(mark, message) {
      return parseInt($.trim(message.replace(mark,'')));
    }

    function getStringFromString(mark, message) {
      return message.replace(mark,'');
    }

    var message = $.trim(data.msg).toLowerCase();
    if(message.indexOf('/') == 0) {

      if(message.indexOf('/帮助') != -1) {
        var $chatBoxId = $('#chatbox');

        var msgs = [
        "命令「/音效 x」x代表从0到4的数字,改变对应聊天音效,0为静音",
        "命令「/气泡 x」x代表从1到2的数字,改变聊天气泡效果",
        "命令「/弹幕 x」x代表弹幕内容,每条弹幕使用1猫耳",
        "命令「/推荐声音 x」x代表声音id,推荐一条声音至播放列表,点音符激活",
        "命令「/播放声音 x」x代表声音id,立刻播放声音",
        "还有更多命令请等待开放,喵呜~"];
        //$chatBoxId.prepend(msg);

        $.each(msgs, function(n, msg) {
          chatBox.loadBubble({
            msg:msg,
            type:1,
            sender:{
              id: 0,
              name: '客服M娘',
              iconColor: '#343434m#A21E16m#343434m#181515m#343434',
              icon: 'http://static.missevan.cn/mimages/201501/16/389141afe72a20bff448c230d1c93342202121.png',
              subTitle: ''}
            });
          });

        return false;
      }

      if(message.indexOf('/音效') != -1) {
        var cmdNum = getNumFromString('/音效', message);
        if(cmdNum >=0 && cmdNum <=4) {
          soundManager.destroySound('soundeffect');
          index.mo.soundEffect = cmdNum;
          store.set('音效', cmdNum);
          chatBox.addInfo('音效改动提示', '聊天音效修改为音效'+cmdNum);
          return false;
        } else {
          chatBox.addInfo('音效改动提示', '配置出错，音效配置范围为0~~4');
          return false;
        }
      }

      if(message.indexOf('/气泡') != -1) {
        var cmdNum = getNumFromString('/气泡', message);
        if(cmdNum >=1 && cmdNum <=2) {
          index.mo.bubbleType = cmdNum;
          store.set('气泡', cmdNum);
          chatBox.addInfo('气泡改动提示', '气泡样式修改为气泡'+cmdNum);
          return false;
        } else {
          chatBox.addInfo('气泡改动提示', '配置出错，气泡配置范围为1~~2');
          return false;
        }
      }

      if(message.indexOf('/背景') != -1) {
        var cmdNum = getNumFromString('/背景', message),
        $chatMainId = $('#chatmain');

        if(cmdNum >=1 && cmdNum <=6) {
          index.mo.bgType = cmdNum;
          store.set('背景', cmdNum);
          if(index.mo.bgType == 1) {
            $chatMainId.css('background','#000');
          } else {
            $chatMainId.css('background','url("/images/index/chatbg' + index.mo.bgType + '.jpg")');
          }
          chatBox.addInfo('背景改动提示', '聊天背景修改为背景'+cmdNum);
          return false;
        } else {
          chatBox.addInfo('背景改动提示', '配置出错，背景配置范围为1~~6');
          return false;
        }
      }

      if(message.indexOf('/推荐声音') == 0) {
        var cmdNum = getNumFromString('/推荐声音', message),
        msg;

        moTool.getAjax({
          url: "/sound/getsound?soundid=" + cmdNum,
          callBack: function(data2) {
            var sound = data2.successVal.sound;

            msg = {
              id:sound.id,
              duration:sound.duration,
              username:sound.username,
              soundstr:sound.soundstr,
              soundurl:sound.soundurl,
              soundurl_32:sound.soundurl_32,
              soundurl_64:sound.soundurl_64,
              soundurl_128:sound.soundurl_128,
              front_cover:sound.front_cover
            };

            msg = JSON.stringify(msg);

            data.msg = msg;
            data.type = 3;

            sendMessage(data, function() {
              chatBox.loadBubble({
                msg:data.msg,
                type:data.type,
                sender:index.mo.sender
              });
            });
          },
          showLoad:false
        });

        return false;
      }

      if(message.indexOf('/播放声音') == 0) {
        var cmdNum = getNumFromString('/播放声音', message),
          msg;

        moTool.getAjax({
          url: "/sound/getsound?soundid=" + cmdNum,
          callBack: function(data2) {
            var sound = data2.successVal.sound;

            msg = {
              id:sound.id,
              duration:sound.duration,
              username:sound.username,
              soundstr:sound.soundstr,
              soundurl:sound.soundurl,
              soundurl_32:sound.soundurl_32,
              soundurl_64:sound.soundurl_64,
              soundurl_128:sound.soundurl_128,
              front_cover:sound.front_cover
            };

            msg = JSON.stringify(msg);

            data.msg = msg;
            data.type = 6;

            sendMessage(data, function() {
              chatBox.loadBubble({
                msg:data.msg,
                type:data.type,
                sender:index.mo.sender
              });
            });
          },
          showLoad:false
        });

        return false;
      }

      if(message.indexOf('/弹幕') != -1) {
        var cmdNum = getStringFromString('/弹幕', data.msg);
        data.msg = cmdNum;
        data.type = 5;

        moTool.getAjax({
          url: "/sound/sendchatdm?dm=" + cmdNum,
          callBack: function(data2) {
            var sound = data2.successVal.sound;

            sendMessage(data, function() {
              chatBox.loadBubble({
                msg:data.msg,
                type:data.type,
                sender:index.mo.sender
              });
            });
          },
          showLoad:false
        });
      }

      return false;
    }

    return data;
  },

  showBt: function(btid,color,scolor,ccolor,dr) {
    var randomCenterPointY = parseInt(Math.random()*(8+1)+1)/10;

    $(btid).bt({
      showTip: function(box) {
        var $content = $('.bt-content', box).hide(),
          $canvas = $('canvas', box).hide(),
          origWidth = $canvas[0].width,
          origHeight = $canvas[0].height,
          messageHeight = $canvas[0].height,
          adder = $canvas[0].height - 70;

        var btb = $(btid);
        if (messageHeight > 100) {
          btb.find('.chatusername').css('position', 'absolute');
          btb.css('padding-top', adder/2)
            .css('margin-bottom', adder/2).fadeIn(200);
        } else {
          btb.css('padding-top', 6)
            .css('margin-bottom', 0).fadeIn(200);
        }

        $(box).show();
        $canvas
          .css({width: origWidth * .25, height: origHeight * .25, left: origWidth * .01, top: origHeight * .3, opacity: .1})
          .show()
          .animate({width: origWidth, height: origHeight, left: 0, top: 0, opacity: 1}, 450, 'easeOutBounce',
            function() {
              $content.show();
            });
      },
      /* when using hideTip, do NOT forget 'callback' at end of animation */
      hideTip: function(box, callback) {
        var $content = $('.bt-content', box).hide(),
        $canvas = $('canvas', box),
        origWidth = $canvas[0].width,
        origHeight = $canvas[0].height;

        $canvas
          .animate({width: origWidth * .5, height: origHeight * .5, left: origWidth * .25, top: origHeight * .25, opacity: 0}, 0, 'swing', callback); /* callback */
      },
      position: ['right'],
      padding: 20,
      width: 600,
      shrinkToFit: true,
      spikeLength: 22,
      spikeGirth: 12,
      centerPointY: randomCenterPointY,
      cornerRadius: 15,
      fill: 'rgba(255, 255, 255, .8)',
      strokeWidth: 4,
      strokeStyle: scolor,
      mowangsk_colors: color,
      addType:1,
      shadow: true,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowBlur: 8,
      shadowColor: 'rgba(0,0,0,.9)',
      cssStyles: {color: ccolor,fontSize: 24,fontFamily: 'Microsoft YaHei,Verdana',letterSpacing: 6, wordBreak: 'break-all',  wordWrap: 'break-word'}
    }).btOn();
  },

  loadBubble: function(data, cb) {
    var subTitle = "";
    if(data.sender.subTitle != "") {
      var subTitleColor = (data.sender.iconColor.split('m')[0] == '#000000')? "#A3A3A3":data.sender.iconColor.split('m')[0];

      subTitle = '<br />' + "<span style='color:" + subTitleColor + ";'>" + data.sender.subTitle + '</span>';
    }

    var iconColor = data.sender.iconColor == ''?'#91c0edm#cde1edm#709cc9m#5079c9m#709cc9':data.sender.iconColor;

    switch(data.type) {
      case 1: //公聊
      case 7: //图片
        var $chatBoxId = $('#chatbox'),
        userNameColor = index.mo.bgType != 1?'#000000':'#ffffff';

        data.sender.icon == ''?(data.sender.icon = index.mo.defaultIcon):'';

        if (index.mo.bubbleType == 2) {
          iconColor =
            data.sender.iconColor.split('m')[0] + 'm' +
            data.sender.iconColor.split('m')[0] + 'm' +
            data.sender.iconColor.split('m')[0] + 'm' +
            data.sender.iconColor.split('m')[0] + 'm' +
            data.sender.iconColor.split('m')[0];
        }

        $chatBoxId.prepend("<div class='clear'></div>"
          + "<div id='chatline" + index.mo.chatLine + "' data-userid='" + data.sender.id + "' data-username='" + data.sender.name + "' class='target' style='display:none;'>"
          + "<div class='chaticonbox'><img src='" + data.sender.icon + "'></div>"
          + "<div class='clear'></div>"
          + "<div class='chatusername' style='color:" + userNameColor + ";'>" + data.sender.name + subTitle + "</div>"
          + "</div>");

        index.soundBox.playChat();

        var text;

        var fnshowbt = function (dr) {
          $('#chatline' + index.mo.chatLine).data('bubble', text);
          chatBox.showBt('#chatline' + index.mo.chatLine, iconColor.split('m'), "#ffffff", "#ffffff", dr);
          chatBox.addIconOpen("#chatline" + index.mo.chatLine);
          chatBox.addNameAt("#chatline" + index.mo.chatLine);

          index.mo.chatLine++;

          chatBox.delChats();
          if (cb) cb();
        };

        if (data.type == 1) {
          //文字
          text = moTool.boardReplaceTxt(data.msg);
          text = text.replace(/\n/g, '<br>');
          fnshowbt();
        } else if (data.type == 7) {
          //图片
          var img = new Image();
          img.onload = function () {
            var h = this.height;
            var w = this.width;
            if (w > 600) {
              w = 600;
              h = Math.floor(600 * this.height / this.width);
            }
            if (h > 600) {
              w = Math.floor(600 * this.width / this.height);
              h = 600;
            }

            text = '<div class="bt-image"><a target="_blank" href="' + data.msg + '">' +
              '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />' +
              '</a></div>';

            fnshowbt(true);
          };
          img.src = data.msg;

        } else {
          text = '';
        }

        return;
        break;

      case 2: //私聊
      case 8: //图片
        var targetId = data.sender.id == index.mo.sender.id ? data.userId:data.sender.id,
          targetName = data.sender.id == index.mo.sender.id?'':data.sender.name;

        if(!$('#privatechatbox' + targetId).length) {
          chatBox.insertPrivateBox(targetId);
          chatBox.loadPrivateBox(targetId, targetName);
        }

        $('#privatechatbox' + targetId)
          .prepend("<div class='clear'></div>"
          + "<div id='privatechatline" + index.mo.pChatLine + "' data-userid='" + data.sender.id + "' data-username='" + data.sender.name + "' class='target' style='display:none;'>"
          + "<div class='chaticonbox'><img width='64px' height='64px' src='" + data.sender.icon + "'></div>"
          + "<div class='clear'></div>"
          + "<div class='chatusername'>" + data.sender.name + subTitle + "</div>"
          + "</div>");

        index.soundBox.playChat();
        //index.soundBox.playChatStr(message.soundUrl);

        var text;
        var fnshowbt = function (dr) {
          $('#privatechatline' + index.mo.pChatLine).data('bubble', text);
          chatBox.showBt('#privatechatline' + index.mo.pChatLine, '#ffffffm#ffffffm#ffffffm#ffffffm#ffffff'.split('m'), iconColor.split('m')[0], '#000000');
          chatBox.addIconOpen('#privatechatline' + index.mo.pChatLine);

          index.mo.pChatLine++;
          //chatBox.delChats();
          if (cb) cb();
        };

        if (data.type == 2) {
          //文字
          text = moTool.boardReplaceTxt(data.msg);
          fnshowbt();
        } else if (data.type == 8) {
          //图片
          var img = new Image();
          img.onload = function () {
            var h = this.height;
            var w = this.width;
            if (w > 400) {
              w = 400;
              h = Math.floor(400 * this.height / this.width);
            }
            if (h > 400) {
              w = Math.floor(400 * this.width / this.height);
              h = 400;
            }

            text = '<div class="bt-image"><a target="_blank" href="' + data.msg + '">' +
              '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />' +
              '</a></div>';

            fnshowbt(true);
          };
          img.src = data.msg;
        }

        //接收私聊信息自动显示
        var $privateBoxUserIdId = $('#privatebox' + targetId);

        $privateBoxUserIdId.addClass('privateboxshow');

        return;
        break;

      case 3:
        data.msg = JSON.parse(data.msg);
        chatBox.addSound(data.msg, data.sender);
        chatBox.addInfo('声音推荐提示', data.sender.name + ' 推荐声音 「' + data.msg.soundstr + '」');
        break;

      case 5:
        var comment = {
          sound_id: 0,
          border: false,
          color: '#ffffff',
          date: parseInt(new Date().getTime()/1000),
          dbid: 1,
          hash: "D5332364",
          mode: 1,
          pool: 0,
          position: "absolute",
          size: 25,
          stime: 0,
          text: data.msg
        };

        cm.sendComment(comment);
        break;

      case 6:
        data.msg = JSON.parse(data.msg);
        index.soundBox.playChatStr(data.msg.soundurl);
        chatBox.addInfo('声音播放提示', data.sender.name + ' 播放声音 「' + data.msg.soundstr + '」');
        break;
    }

    chatBox.delChats();
  },

  loadBt: function(message) {
    if(message.subTitle) {
      var subTitleColor = (message.colors.split('m')[0] == '#000000')? "#A3A3A3":message.colors.split('m')[0];

      message.subTitle = '<br />' + "<span style='color:" + subTitleColor + ";'>" + message.subTitle + '</span>';
    } else {
      message.subTitle = '';
    }
    if(message.$chatBoxId.length && message.$chatBoxId.attr('id').indexOf('private') == -1) {
      var userNameColor = '#ffffff';

      if(index.mo.bgType != 1) {
        userNameColor = '#000000';
      }

      if(message.colors == '') {
        message.colors = '#91c0edm#cde1edm#709cc9m#5079c9m#709cc9';
      }

      if(message.picture == '') {
        message.picture = index.mo.defaultIcon;
      }

      if(index.mo.bubbleType != 1) {
        message.colors =
          message.colors.split('m')[0] + 'm' +
          message.colors.split('m')[0] + 'm' +
          message.colors.split('m')[0] + 'm' +
          message.colors.split('m')[0] + 'm' +
          message.colors.split('m')[0];
      }

      message.$chatBoxId.prepend("<div class='clear'></div>"
        + "<div id='chatline" + index.mo.chatLine + "' data-userid='" + message.userId + "' data-username='" + message.userName + "' class='target' style='display:none;'>"
        + "<div class='chaticonbox'><img width='64px' height='64px' src='" + index.mo.iconPath + message.picture + "'></div>"
        + "<div class='clear'></div>"
        + "<div class='chatusername' style='color:" + userNameColor + ";'>" + message.userName + message.subTitle + "</div>"
        + "</div>");

      index.soundBox.playChat();
      index.soundBox.playChatStr(message.soundUrl);

      $('#chatline' + index.mo.chatLine).data('bubble',moTool.boardReplaceTxt(message.value));
      chatBox.showBt('#chatline' + index.mo.chatLine,message.colors.split('m'),message.spikeColor,message.charColor);
      chatBox.addIconOpen("#chatline" + index.mo.chatLine);
      chatBox.addNameAt("#chatline" + index.mo.chatLine);

      index.mo.chatLine ++;
    } else {
      var targetId = message.userId == index.mo.userId?message.toUserId:message.userId,
      targetName = message.userName == index.mo.username?message.toUserName:message.userName;

      if(!$('#privatechatbox' + targetId).length) {
        chatBox.insertPrivateBox(targetId);
        chatBox.loadPrivateBox(targetId, targetName);
      }

      $('#privatechatbox' + targetId)
        .prepend("<div class='clear'></div>"
          + "<div id='privatechatline" + index.mo.pChatLine + "' data-userid='" + message.userId + "' data-username='" + message.userName + "' class='target' style='display:none;'>"
          + "<div class='chaticonbox'><img width='64px' height='64px' src='" + index.mo.iconPath + message.picture + "'></div>"
          + "<div class='clear'></div>"
          + "<div class='chatusername'>" + message.userName + message.subTitle + "</div>"
          + "</div>");

      index.soundBox.playChat();
      index.soundBox.playChatStr(message.soundUrl);

      $('#privatechatline' + index.mo.pChatLine).data('bubble',moTool.boardReplaceTxt(message.value));
      chatBox.showBt('#privatechatline' + index.mo.pChatLine, message.colors.split('m'), message.spikeColor, message.charColor);
      chatBox.addIconOpen('#privatechatline' + index.mo.pChatLine);

      //接收私聊信息自动显示
      var $privateBoxUserIdId = $('#privatebox' + targetId);

      $privateBoxUserIdId.addClass('privateboxshow');

      index.mo.pChatLine++;
    }
  },

  loadRoomList: function(person) {
    if(person.room.indexOf('t') == 0) {
      var $roomId = $('#room' + person.room);
    } else {
      var $roomId = $('#room' + person.room);
    }

    if ($roomId.length) {
      var memberCount = $roomId.find('.roombarmember').length;
      if (person.number == '+1') {
        var roomFloatStr = "<div class='roombarfloat'>，</div>";
        var roomMemberStr =
          '<div class="roombarmember roombarmember' + person.personInfo.id + '" style="display:none;">'
          + '<a target="_blank" href="/' + person.personInfo.id +'">'
          + '<img src="' + person.personInfo.icon + '">'
          + '</a>&nbsp;<a target="_blank" href="/' + person.personInfo.id + '">' + person.personInfo.name + '</a>'
          +'</div>';

        if (memberCount == 0) {
          $roomId.find('.roombarcontainer').prepend(roomMemberStr);
        } else {
          $roomId.find('.roombarmember:last').after(roomFloatStr + roomMemberStr);
        }

        $roomId.find('.roombarmember' + person.personInfo.id).fadeIn();
        memberCount++;
      } else {
        $roomId.find('.roombarmember' + person.personInfo.id).fadeOut(
          function() {
            if($roomId.find('.roombarmember').length == 0) {
              $(this).remove();
            } else {
              if($(this).next().hasClass('roombarfloat')) {
                $(this).next().remove();
                $(this).remove();
              } else {
                $(this).prev().remove();
                $(this).remove();
              }
            }

          }
        );
        if (memberCount <= 0) {
          memberCount = 0;
        } else {
          memberCount--;
        }
      }

      $roomId.find('.membercount').text(memberCount);
    }
  },

  loadState: function(state) {
    var $chatBoxId = $('#chatbox');
    $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>" + moTool.boardReplaceTxt(state) + "</div><div class='clear'></div>");
  },

  loadMemberState: function(member, state) {
    var $chatBoxId = $('#chatbox');
    $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>►► " + member.username + " " + moTool.boardReplaceTxt(state) + "</div><div class='clear'></div>");
  },

  loadLeavingMember: function(member) {
    var $chatBoxId = $('#chatbox');
    $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>►► " + member.username + " 离开了聊天室</div><div class='clear'></div>");
  },

  loadNewMember: function(member) {
    var $chatBoxId = $('#chatbox');
    $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>►► " + member.username + " 加入聊天室</div><div class='clear'></div>");
  },

  loadNewMembers: function(members) {
    $.each(members,function(n,member) {
      chatBox.loadNewMember(member);
    });
  },

  loadNewM: function(roomMembers) {
    var $chatBoxId = $('#chatbox'),
    $userListId = $('#userlist');

    //判断是否有人加入
    $.each(roomMembers,function(n,roomMember) {
      var flag = 0;

      for(var i = 0;i < index.mo.members.length;i ++) {
        if(roomMember.username == index.mo.members[i].username) {
          flag = 1;
        }
      }

      if(flag == 0) {
        if(index.mo.messageType == 1) {
          chatBox.loadBt({
            $chatBoxId: $('#chatbox'),
            userId: index.mo.userId,
            userName: '黑化店长',
            picture: index.mo.servicePicture,
            colors: index.mo.serviceColors,
            spikeColor: index.mo.serviceSpikeColor,
            charColor: index.mo.serviceCharColor,
            value: '---' + roomMember.username + '---加入聊天室',
            soundUrl: ''
          });
        } else {
          $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>---" + roomMember.username + "---加入聊天室</div><div class='clear'></div>");
        }

        var newUserStr =
        "<div id='userlist" + roomMember.userid + "' class='table'>"
        + "<div class='table1'>" + roomMember.userid + "</div>"
        + "<div class='table2'>" + roomMember.username + "</div>"
        + "<div class='table3'>" + roomMember.point + "</div>"
        + "<div class='table4'>" + roomMember.subtitle + "</div>"
        + "</div>";

        $(newUserStr).appendTo($userListId);
      }
    });

    //判断是否有人离开
    $.each(index.mo.members,function(n,member) {
      var flag = 0;

      for(var i = 0;i < roomMembers.length;i ++) {
        if(member.username == roomMembers[i].username) {
          flag = 1;
        }
      }

      if(flag == 0) {
        if(index.mo.messageType == 1) {
          chatBox.loadBt({
            $chatBoxId: $('#chatbox'),
            userId: index.mo.userId,
            userName: '黑化店长',
            picture: index.mo.servicePicture,
            colors: index.mo.serviceColors,
            spikeColor: index.mo.serviceSpikeColor,
            charColor: index.mo.serviceCharColor,
            value: '---' + member.username + '---退出聊天室',
            soundUrl: ''
          });
        } else {
          $chatBoxId.prepend("<div class='clear'></div><div class='chatmessage'>---" + member.username + "---退出聊天室</div><div class='clear'></div>");
        }

        $('#userlist' + member.userid).remove();
      }
    });

    index.mo.members = roomMembers;
  },

  addIconOpen: function(chatId) {//点击头像打开
    $(chatId).find('.chaticonbox').click(function() {
      var userName = $(this).parent().data('username'),
      userId = $(this).parent().data('userid'),
      $privateBoxUserIdId = $('#privatebox' + userId);

      if(!$privateBoxUserIdId.length) {
        chatBox.insertPrivateBox(userId);
        chatBox.loadPrivateBox(userId, userName);
      }

      var $privateBoxUserIdId = $('#privatebox' + userId);

      //接收私聊信息自动显示
      $privateBoxUserIdId.addClass('privateboxshow');
    });
  },

  addNameAt: function(chatId) {
    var $inputBoxTextAreaId = $('#inputboxtextarea');

    $(chatId).find('.chatusername').click(function() {
      $inputBoxTextAreaId.val($inputBoxTextAreaId.val() + '@' + $(chatId).data('username'));
    });
  },

  insertPrivateBox: function(userId) {
    var insertPrivateBoxValue = "",
    $privateId = $('#private');

    insertPrivateBoxValue = insertPrivateBoxValue
      + "<div id='privatebox" + userId + "' class='privatebox'>"
      + "<div id='privateclose" + userId + "' class='privateclose'>×</div>"
      + "<div class='privatetitlebox'>Secret Mode "
      + "<span id='privatesubtitlebox" + userId + "' class='privatesubtitlebox'>Nobody</span>"
      + "</div>"
      + "<div class='privateinputbox'>"
      + "<div class='privateinputboxtextareaouter'>"
      + "<textarea id='privateinputboxtextarea" + userId + "' class='privateinputboxtextarea'></textarea>	"
      + '<div id="imagefile"><img id="fileuploadbtn" src="/images/backend/insert.png" /><input type="file" id="image" name="image" style="display:none" /></div>'
      + "</div>"
      + "<div class='privateinputboxtextareapostbox'>"
      + "<div id='privateinputboxtextareapostbtn" + userId + "' class='privateinputboxtextareapostbtn'>POST</div>"
      + "</div>"
      + "</div>"
      + "<div id='privatechatbox" + userId + "' class='privatechatbox'>"
      + "</div>"
      + "</div>";

    $privateId.prepend(insertPrivateBoxValue);
    initImageUpload(userId, '#privatebox' + userId);
  },

  loadPrivateBox: function(userId,userName) {
    var $privateSubTitleBoxUserIdId = $('#privatesubtitlebox' + userId),
    $privateBoxUserIdId = $('#privatebox' + userId),
    $privateCloseUserIdId = $('#privateclose' + userId),
    $privateChatBoxUserIdId = $('#privatechatbox' + userId),
    $privateInputBoxTextareaUserIdId = $('#privateinputboxtextarea' + userId),
    $privateInputBoxUserIdId = $('#privateinputbox' + userId),
    $privateInputBoxTextareaPostBtnUserIdId = $('#privateinputboxtextareapostbtn' + userId);

    index.mo.privateSendFlag['#privatebox' + userId] = 0;

    //私聊框内
    $privateSubTitleBoxUserIdId.html(userName);

    $privateBoxUserIdId.click(function() {
      $('.privatebox').css('z-index','10000');
      $(this).css('z-index','10001');
    }).draggable({
      handle: '.privatetitlebox,.privateinputbox',
      scroll: false,
      drag: function() {
        $privateChatBoxUserIdId.css('overflow','hidden');
        $(this).css('cursor','move');
      },
      stop: function() {
        $privateChatBoxUserIdId.css('overflow','auto');
        $(this).css('cursor','auto');
      }
    });

    //支持关闭
    $privateCloseUserIdId.click(function() {
      console.log($privateBoxUserIdId.css('left'));
      $privateBoxUserIdId.removeClass('privateboxshow');
      $privateInputBoxUserIdId.hide();
    });

    //私聊
    $privateInputBoxTextareaUserIdId.keypress(function(event) {
      if (event.which != 13) {
        if (this.value.length >= index.mo.maxLength) {
          event.preventDefault();
        }
      }

      if (event.which == 13) {
        event.preventDefault();
        $privateInputBoxTextareaPostBtnUserIdId.click();
      }
    });

    //按下私聊POST按钮
    $privateInputBoxTextareaPostBtnUserIdId.click(function(event) {
      if($privateInputBoxTextareaUserIdId.val() == '') return;
      $privateInputBoxTextareaUserIdId.val($privateInputBoxTextareaUserIdId.val().substring(0, index.mo.maxLength));

      var msg = $privateInputBoxTextareaUserIdId.val();
      userId = parseInt(userId);
      sendMessage({msg:msg, userId:userId, type:2}, function() {
        //console.log(index.mo.sender);
        chatBox.loadBubble({
          msg:msg,
          type:2,
          sender:index.mo.sender,
          userId:userId
        });
      });

      $privateInputBoxTextareaUserIdId.val("");
    });
  }

};

var chatRoomList = {
  loadTeamRoom: function() {
    var $getTicketId = $('#getticket');

    $getTicketId.click(function(e) {
      e.preventDefault();
      moTool.getAjax({
        url:"/chat/room/ticket",
        callBack: function (data) {
          if (data) {
            if (data.code == 0) {
              var url = 'http://www.missevan.cn/chat/room?ticket=' + data.ticket;
              moTool.showSuccess(url);
            } else if (data.message) {
              moTool.showError(data.message);
            }
          }
        },
        showLoad: true,
        success: false,
        error: false,
        json: false
      });
    });
  },

  addNewRoom: function(roomInfo, pos) {
    var str = "";

    var roomNumId = roomInfo.id.toString().replace('t', '');
    var $roomId = $('#room' + roomInfo.id);
    if ($roomId && $roomId.length) {
      return;
    }

    if (chatBox.isMobile) {
      str = str
        + '<a target="_blank" href="/chat/room?roomId=' + roomNumId + '" id="room' + roomInfo.id + '" class="roombar roombarheight">'
        + '<div class="usernumwidth"><span class="membercount">0</span>/' + roomInfo.maxNum + '</div>'
        + '<div class="roomnamewidth">' + roomInfo.name + '</div>';
    } else {
      str = str
        + "<div id='room" + roomInfo.id + "' class='roombar pie'>"
        + "<div class='roomnamewidth'>" + roomInfo.name + "</div>"
        + "<div class='usernamewidth'>"
        + "<a target='_blank' href='/" + roomInfo.userId + "'>" + roomInfo.userName  + "</a>"
        + "</div>"
        + "<div class='usernumwidth'>人数: <span class=\"membercount\">0</span>/" + roomInfo.maxNum + "</div>"
        + "<a target='_blank' class='go1 pie' href='/chat/room?roomId=" + roomNumId + "'>加入</a>"
    }

    str = str
      + "<div class='clear'></div>"
      + "<div class='roombarcontainer'>"
      + "<div class='clear'></div>"
      + "</div>";

    if (chatBox.isMobile) {
      str += '<div class="roombardown"></div></a>';
    } else {
      str += "</div>";
    }

    if (pos == 'last') {
      var $roombar = $('.roombar:last');
      $roombar.after(str);
    } else if (pos == 'begin') {
      var $roombar = $('.roombar.grouproom');
      if ($roombar.length <= 0) {
        $roombar = $('#room0');
      }
      $roombar.after(str);
    } else {
      var $boxId = $('#room0');
      $boxId.after(str);
    }

    if (chatBox.isMobile) {
      chatBox.loadRoomBarDown($('.roombardown:last'));
    }
  },

  loadNewRoom: function() {
    var $newRoomBtnId = $('#newroombtn'),
      $newRoomNameId = $('#newroomname'),
      $newRoomNum = $('#newroomnum'),
      $newRoomType = $('#newroomtype'),
      $addRoomId = $('#addroom');

    $addRoomId.click(function() {
      $('#room0').toggle();
    });

    $newRoomBtnId.click(function(event) {
      var $errorBoxTextId = $('#errorboxtext'),
        $errorBoxContentId = $("#errorboxcontent");

      var roomName = $newRoomNameId.val();
      var roomNum = $newRoomNum.val();
      var roomType = $newRoomType.val();

      if(roomName == '') {
        moTool.showError('房间名不能为空');
        return false;
      } else if(roomName.length > 24) {
        moTool.showError('房间名不能超过24个字符');
        return false;
      }


      if(roomNum == '') {
        moTool.showError('房间人数不能为空');
        return false;
      } else if(!(roomNum <= 30 && roomNum>=2)) {
        moTool.showError('房间人数必须在2~30之间');
        return false;
      }

      moTool.postAjax({
        url: "/chat/room/new",
        value: { name: roomName, maxNum: roomNum, type: roomType },
        callBack: function (data) {
          if (data) {
            if (data.code == 0) {
              chatRoomList.addNewRoom(data.roominfo);
            } else if (data.message) {
              moTool.showError(data.message);
            }
          }
        },
        showLoad: false,
        success: false,
        error: false,
        json: false
      });

      //				if($(this).parent().find('.go3').length) {
      //					roomCode = $(this).parent().find('.go3').val();
      //
      //					if(roomCode == '' || roomCode == '请输入房间密码') {
      //						moTool.showError('密码不能为空');
      //						return false;
      //					} else if(roomCode.match(/^[a-zA-Z0-9]+$/) == null) {
      //						moTool.showError('密码只能含数字和字母');
      //						return false;
      //					}
      //
      //					$(this).attr('href', $(this).attr('href') + roomCode);
      //				}
    });
  },

  loadRoomList: function() {
    var $newRoomType = $('#newroomtype');
    var roomType = $newRoomType.val();

    moTool.getAjax({
      url: "/chat/room/list?type=" + roomType,
      callBack: function (data) {
        if (data) {
          if (data.code == 0) {
            //加载列表
            for (var i = 0; i < data.roomlist.length; i++) {
              chatRoomList.addNewRoom(data.roomlist[i], 'last');
            }
            //加载成员
            for (var roomId in data.members) {
              var members = data.members[roomId];
              for (var i = 0; i < members.length; i++) {
                var p = {
                  room: roomId,
                  number: '+1',
                  personInfo: chatBox.sender(members[i], true)
                };
                chatBox.loadRoomList(p);
              }
            }
          } else if (data.message) {
            moTool.showError(data.message);
          }
        }
      },
      showLoad: false,
      success: false,
      error: false,
      json: false
    });
  }
};

var loadChat = function() {
  chatBox.loadChatOption();

  chatBox.loadChatBox();

  chatBox.loadUser();

  if (!chatBox.isMobile) {
    index.js.loadChatDm();

    chatBox.addInfo('我是M娘', '有问题请输入“/帮助”');
  }
};

var loadRoom = function() {
  chatRoomList.loadTeamRoom();
  chatRoomList.loadNewRoom();
  chatRoomList.loadRoomList();
};
