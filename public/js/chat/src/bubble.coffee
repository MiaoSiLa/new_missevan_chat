
class ChatBubble
  constructor: ->

  init: ->
    $cm = $ '#chatmain .container'
    $cm.prepend '<div id="chatbubble"><ul id="chat"></ul></div>'
    @el = $cm.find '#chat'
    return

  reset: ->
    # $('#chatbox').html ''
    @el.html ''
    return

  text: (str) ->
    text = moTool.boardReplaceTxt str
    chathtml = '<li id="chatline' + index.mo.chatLine + '"><div class="chatinfo"><span>' + text + '</span></div></li>'

    index.mo.chatLine++
    @el.prepend chathtml

    return

  popup: (data, cb) ->
    self = @

    subTitle = ''
    iconColor = if data.sender.iconColor? then data.sender.iconColor else '#91c0edm#cde1edm#709cc9m#5079c9m#709cc9';
    
    colorlist = iconColor.split 'm'

    if data.sender.subTitle
      subTitleColor = if colorlist[0] is '#000000' then "#A3A3A3" else colorlist[0]
      subTitle = "<span style='color:" + subTitleColor + ";'>" + moTool.boardReplaceTxt(data.sender.subTitle) + '</span>';

    userNameColor = if index.mo.bgType is 1 then '#ffffff' else '#000000'
    userName = data.sender.name
    userNameHtml = moTool.boardReplaceTxt userName
    if subTitle
      userNameHtml += ' (' + subTitle + ')'

    switch data.type
      when 1
        #公聊
        text = moTool.boardReplaceTxt data.msg
        text = text.replace /\n/g, '<br>'

        chathtml = '<li id="chatline' + index.mo.chatLine + '">\n'\
                 + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n'\
                 + '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n'\
                 + '  <div class="userSay">\n'\
                 + '    <div class="inlineText">' + text + '</div>\n'\
                 + '  </div>\n'\
                 + '</li>';

        index.mo.chatLine++;
        @el.prepend chathtml

        cb() if cb?

      when 7
        #图片
        img = new Image()
        img.onload = ->
          h = @height;
          w = @width;
          if w > 600
            w = 600
            h = Math.floor(600 * @height / @width)
          if h > 600
            w = Math.floor(600 * @width / @height)
            h = 600

          imghtml = '<a target="_blank" href="' + data.msg + '">'\
               + '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />'\
               + '</a>';
          chathtml = '<li id="chatline' + index.mo.chatLine + '">\n'\
               + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n'\
               + '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n'\
               + '  <div class="userChatImage">' + imghtml + '</div>\n'\
               + '</li>';

          index.mo.chatLine++;
          self.el.prepend chathtml

          cb() if cb?
          return
        img.src = data.msg

    index.soundBox.playChat();
    return