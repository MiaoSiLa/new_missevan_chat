
class ChatBubble
  constructor: ->
    # @_direction = 'down'
    @_showname = on

  init: ->
    @stage = $ '#commentCanvas'
    $cm = $ '#chatmain .container'
    $cm.prepend '<div id="chatbubble"><ul id="chat"></ul></div>'
    @el = $cm.find '#chat'

    # fix bugs in mobile view
    if chatBox.isMobile
      moTool.boardReplaceTxt = GG.util.escape
      index.mo.chatLine = 1
      $cm.find('#chatbubble').css('width', '100%')

    return

  reset: ->
    # $('#chatbox').html ''
    @el.html ''
    @background()
    return

  xss: (str) ->
    s1 = str.replace /<img [^>]*?src=(".+?")[^>]*?\/?>/gi, "|img:$1|"
    s2 = moTool.boardReplaceTxt s1
    s2.replace /\|img\:&quot;(.+?)&quot;\|/gi, "<img src=\"$1\" />"

  showname: (@_showname) ->

  addhtml: (html) ->
    # @el.prepend html
    @el.append html
    $('#chatmain').animate { scrollTop: @el.height() }, 200
    return

  text: (str) ->
    text = moTool.boardReplaceTxt str
    chathtml = '<li id="chatline' + index.mo.chatLine + '"><div class="chatinfo"><span>' + text + '</span></div></li>'

    index.mo.chatLine++
    @addhtml chathtml
    return

  background: (data, cb) ->
    # TODO: effect?
    if data
      img = new Image()
      img.onload = ->
        $('#chatmain').css 'background-image', 'url(' + data.url + ')'
        cb() if cb?
        return
      img.src = data.url
    else
      $('#chatmain').css 'background-image', 'none'
      cb() if cb?
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
        text = @xss data.msg
        text = text.replace /\n/g, '<br>'

        chathtml = '<li id="chatline' + index.mo.chatLine + '">\n'\
                 + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n';

        if @_showname
          # show name
          chathtml += '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n'

        chathtml += '  <div class="userSay">\n'\
                 + '    <div class="inlineText">' + text + '</div>\n'\
                 + '  </div>\n'\
                 + '</li>';

        index.mo.chatLine++;
        @addhtml chathtml

        cb() if cb?

      when 7
        #图片
        img = new Image()
        img.onload = ->
          h = @height
          w = @width

          maxw = 600
          if chatBox.isMobile
            maxw = 225

          if w > maxw
            w = maxw
            h = Math.floor(maxw * @height / @width)
          if h > 600
            w = Math.floor(600 * @width / @height)
            h = 600

          imghtml = '<a target="_blank" href="' + data.msg + '">'\
               + '<img style="width:' + w + 'px;height:' + h + 'px" src="' + data.msg + '" />'\
               + '</a>';
          chathtml = '<li id="chatline' + index.mo.chatLine + '">\n'\
               + '  <div class="userFace"><img src="' + data.sender.icon + '" alt=""></div>\n';

          if self._showname
            # show name
            chathtml += '  <div class="userName" style="color:' + userNameColor + '">' + userNameHtml + '</div>\n'

          chathtml += '  <div class="userChatImage">' + imghtml + '</div>\n'\
               + '</li>';

          index.mo.chatLine++;
          self.addhtml chathtml

          cb() if cb?
          return
        img.src = data.msg

    play.soundBox.playChat()
    return

  tobottom: ->
    @stage.animate { scrollTop: @el.height() }, 1000
    return
