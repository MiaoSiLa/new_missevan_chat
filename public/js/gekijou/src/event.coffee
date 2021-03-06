class GAction
  constructor: (@type) ->
    if @type is 'text'
      @ready = on
    else
      @ready = no

  load: (cb) ->
    if @ready
      cb()
      return

    self = @
    switch @type
      when 'image', 'background'
        img = new Image()
        img.onload = ->
          self.ready = on
          cb()
          return
        img.src = @val
        self.img = img
      when 'sound'
        # 立即展示下不加载音频
        if GG.env isnt 'dev' and GG.opts['instantshow']
          cb()
          return

        GG.sound.get @val, (data) ->
          if data and data.state is 'success' and \
              data.info and data.info.sound
            sound = data.info.sound
            self.Jsound = sound
            self.sound = GG.sound.load sound.soundurl, ->
              self.ready = on
              cb()
              return
          else
            moTool.showError '加载声音 ' + self.val + ' 失败！'
          return
      else
        cb()

    return

  attachlaststate: ->
    # 弃用
    # hack to state
    $cm = $ '#chatbox .chatmessage:first'
    if ($cm and $cm.length is 1)
      @line = index.mo.chatLine
      $cm.attr('id', 'chatline' + @line)
      index.mo.chatLine++
    return

  attacheditor: ->
    if @line >= 0
      $line = $ '#chatline' + @line
      $line.prepend """
                    <div class="line-editor" data-line="#{@line}" data-actionid="">
                      <div class="line-del">x</div>
                    </div>
                    """
      $line.find('.line-del').click (e) ->
        line = $(this).parent().data('line')
        if GG.em.removeLine parseInt(line)
          $line.remove()
        e.stopPropagation()
        return
    return

  stop: ->
    if @type is 'sound'
      skey = @stype
      if @stype is 'chara'
        skey += ':' + @chara
      GG.sound.stop skey
    else if @type is 'background'
      GG.bubble.background null
    return

  run: (cb) ->
    action = @
    @load ->
      hasChara = off
      if action.chara?
        # 切换角色
        hasChara = GG.chara.selectId action.chara

      callback = ->
        if GG.env is 'dev'
          action.attacheditor()

        cb() if cb?

      switch action.type
        when 'text'
          if not hasChara
            if GG.env is 'dev'
              action.line = index.mo.chatLine
              GG.bubble.text '错误的内容'
              moTool.showError '请先选择一个角色'

            callback()
            return

          action.line = index.mo.chatLine
          #chatBox.loadBubble
          GG.bubble.popup
            msg: action.val,
            type: 1,
            sender: index.mo.sender,
            showon: GG.chara.currentShowOn()
          callback()
        when 'state'
          # for bubble style
          if action.stype is 'text'
            action.line = index.mo.chatLine

            statetext = action.val
            if action.chara isnt -1
              #chatBox.loadState action.val
              #chatBox.loadMemberState { username: index.mo.sender.name }, action.val
              statetext = '►► ' + index.mo.sender.name + ' ' + statetext

            GG.bubble.text statetext
            callback()
          else if action.stype is 'image'
            GG.bubble.stateimage action.val, ->
              action.line = index.mo.chatLine - 1
              callback()
              return

          #if GG.env is 'dev'
          #  action.attachlaststate()
        when 'image'
          if action.chara isnt -1
            GG.bubble.popup { msg: action.val, type: 7, sender: index.mo.sender, showon: GG.chara.currentShowOn()  }, ->
              action.line = index.mo.chatLine - 1
              callback()
              return
          else
            # 状态图片
            GG.bubble.stateimage action.val, ->
              action.line = index.mo.chatLine - 1
              callback()
              return


        when 'background'
          GG.bubble.background { url: action.val, effect: action.effect }, ->
            if GG.env is 'dev'
              # editor
              action.line = index.mo.chatLine
              statetext = ': ' + "切换背景"
              GG.bubble.text statetext
            callback()
            return

        when 'sound'
          # play sound
          # msg = JSON.stringify action.Jsound
          #chatBox.loadBubble
          #  msg: msg,
          #  type: 6,
          #  sender: index.mo.sender

          if GG.env isnt 'dev' and GG.opts['instantshow']
            # 非开发模式立即展示下不加载/提示/播放音频
            callback()
            return

          soundname = if action.Jsound then action.Jsound.soundstr else ''
          soundmsg = ''
          soundkey = ''
          switch action.stype
            when 'chara'
              soundmsg = "播放了声音 「#{soundname}」"
              if index.mo.sender and index.mo.sender.name
                soundmsg = index.mo.sender.name + ' ' + soundmsg
              soundkey = 'chara:' + action.chara
            when 'effect'
              soundmsg = "音效 「#{soundname}」"
              soundkey = 'effect'
            when 'background'
              soundmsg = "背景乐 「#{soundname}」"
              soundkey = 'background'

          GG.sound.play soundkey, action.Jsound.soundurl, ->
            if action.stype is 'background'
              # 提示背景乐
              chatBox.addInfo '声音播放提示', soundmsg

            if GG.env is 'dev'
              #chatBox.loadMemberState { username: index.mo.sender.name }, "播放了声音「#{soundname}」"
              #action.attachlaststate()
              action.line = index.mo.chatLine
              statetext = ': ' + soundmsg
              GG.bubble.text statetext

            callback()
            return

    return

class GEvent

  constructor: (@id, @name, @time) ->
    @actions = []

  action: (type, val1, val2, norun) ->
    an = new GAction type

    switch type
      when 'text'
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          an.run()

      when 'image'
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          an.run ->
            #image do some thing here

      when 'background'
        an.effect = val1
        an.val = val2
        if not norun
          an.run()

      when 'sound'
        if @isCharaId val1
          an.chara = @parseCharaId val1
          an.stype = 'chara'
        else
          an.chara = -1
          an.stype = val1

        # soundurl
        an.val = val2

        if not norun
          an.run ->
            # TODO: show some tips in stage

      when 'state'
        if val1.stype is 'text'
          an.chara = @parseCharaId(val1.chara)
        an.stype = val1.stype
        an.val = val2
        if not norun
          an.run ->
            #image do some thing here

      else return

    @actions.push an
    return

  removeLine: (line) ->
    found = no
    for ac, i in @actions
      if ac.line is line
        ac.stop()
        @actions.splice i, 1
        found = on
        break
    found

  run: (i = 0, cb) ->
    if typeof i is 'function'
      # swap i and cb
      cb = i
      i = 0

    if i < @actions.length
      self = @
      @actions[i].run ->
        self.run i + 1, cb
        return
    else
      cb() if cb?

    return

  isCharaId: (charaid) ->
    switch typeof charaid
      when 'string'
        /^(no)?chara/.test(charaid)
      when 'number'
        on
      else
        off

  parseCharaId: (charaid) ->
    if typeof charaid is 'number'
      return charaid
    else if typeof charaid is 'string'
      if charaid is 'nochara'
        return -1

      cids = charaid.split ':'
      if cids.length is 2 and cids[0] is 'chara'
        return parseInt cids[1]

    return -1

  # parse action text
  parseAction: (text, alltreattext) ->
    if text[0] isnt '/' or alltreattext
      @action 'text', GG.chara.currentId(), text
    else
      cmds = GG.util.splitcommand text
      if not cmds then return
      switch cmds[0]
        when 'sound'
          stype = cmds[1]
          soundid = parseInt cmds[2]
          if soundid
            if stype is 'chara' and GG.chara.currentId() is -1
              # showError 请选择一个角色
              return
            if stype is 'chara'
              stype += ':' + GG.chara.currentId()
            @action 'sound', stype, soundid
        when 'album'
          albumid = parseInt cmds[1]
          if albumid
            # add album
            GG.album.loadAlbum albumid, ->
              GG.album.showSelect()
              return
        when 'state'
          state = cmds[1]
          if state
            @action 'state', { stype: 'text', chara: GG.chara.currentId() } , state
        # 其他特殊动作
        # do some thing

  showImage: (url) ->
    charaid = GG.chara.currentId()
    if charaid isnt -1
      @action 'image', charaid, url
    else
      # 状态图片
      @action 'state', { stype: 'image' }, url

  switchBackground: (url, effect) ->
    # TODO: effect?
    @action 'background', 'default', url

  # parse
  parse: (block) ->
    lines = GG.util.splitline block

    if lines.length > 0
      for line in lines
        lineprops = GG.util.splitprop line
        try
          if lineprops[0] is 'background'
            lineprops[1] = JSON.parse lineprops[1]
          else if lineprops[0] is 'state'
            if @isCharaId lineprops[1]
              stype = 'text'
              lineprops[1] =
                stype: stype
                chara: lineprops[1]
            else
              stype = lineprops[1]
              lineprops[1] =
                stype: stype
              if stype is 'text'
                if lineprops[2][0] is '"'
                  # 直接是文本
                  lineprops[1].chara = -1
                else
                  lineprops[1].chara = lineprops[2]
                  lineprops[2] = lineprops[3]
          @action lineprops[0], lineprops[1], JSON.parse(lineprops[2]), on

    return

  realtime: () ->
    @time

class EventStatus
  constructor: (@em) ->

  status: (_i) ->
    s =
      bg_music: null,
      bg_image: null,
      time: 0

    for ev, i in @em.events
      if i > _i then break

      for ac in ev.actions
        if ac.type is 'sound' and ac.stype is 'background'
          s.bg_music =
            val: ac.val,
            action: ac,
            time: s.time
        else if ac.type is 'background'
          s.bg_image =
            val: ac.val,
            action: ac,
            time: s.time
      s.time += ev.realtime()

    s

  compare: (i2, i1 = -1) ->
    @s2 = @status i2
    @s1 = @status i1 if i1 isnt -1
    return

  valchanged: (k) ->
    if @s2 && @s2[k] && @s2[k].val
      if (not @s1 or @s1 and (not @s1[k] || (@s1[k] and @s1[k].val isnt @s2[k].val)))
        # 原来没有 或者 原来有但是不同
        on
    else if @s1 and @s1[k] and (not @s2 or not @s2[k])
      # 原来有现在没有
      on
    off

  recover: (cb) ->
    if @valchanged('bg_image')
      if @s2 and @s2.bg_image
        @s2.bg_image.action.run()
      # else
        # no possible
        # remove background

    if @valchanged('bg_music')
      @s1.bg_music.action.stop() if @s1 and @s1.bg_music

    if @s2 and @s2.bg_music
      s = @s2.bg_music.action.sound
      if s
        if GG.opts['bgm_sync']
          pos = @s2.time - @s2.bg_music.time
          pos = pos % s.duration
          s.setPosition pos
        if s.playState is 0
          s.play()
        else
          s.resume()

    cb() if cb?
    return

class GEventManager

  constructor: () ->
    @events = []
    @_lastid = 0
    @_event = null
    @_timecount = 0
    @_curtime = 0
    @_currentIndex = -1

  lastid: ->
    @_lastid

  current: (i = -1) ->
    if i isnt -1
      @_currentIndex = i
      @_event = @events[i]
    @_event

  currentIndex: ->
    @_currentIndex

  switchTo: (i) ->
    if @_currentIndex is i
      return

    @_status = new EventStatus(@)
    @_status.compare i, @_currentIndex

    @current i
    return

  next: ->
    if @_currentIndex < @events.length - 1
      @_currentIndex++
      @_event = @events[@_currentIndex]
      return on
    else
      return no

  totaltime: (untili = -1) ->
    if untili isnt -1
      counttime = 0
      for ev, i in @events
        if untili <= i
          return counttime
        counttime += ev.realtime()
    @_timecount

  calc: ->
    pns = []
    cur = 0

    timecount = 0
    for e in @events
      timecount += e.realtime()
    @_timecount = timecount

    for e in @events
      pns.push id: e.id, pos: cur / timecount, name: e.name
      cur += e.realtime()

    if pns.length is 1
      pns[0].pos = 0.5

    pns

  doAction: (type, val1, val2) ->
    if @_event
      if not val2
        val2 = val1
        val1 = GG.chara.currentId()
      @_event.action type, val1, val2
    return

  moveToBegin: ->
    @_currentIndex = -1
    @_event = null
    return

  getNeedPreload: ->
    tt = 0
    res = []
    total = @totaltime()

    for ev, i in @events
      _ctt = ev.realtime()
      len = ev.actions.length

      # 检查需要预先加载的内容
      for ac, j in ev.actions
        pos = (tt + ((j + 1) * _ctt / len)) / total
        switch ac.type
          when 'text'
            # 加载文本中的图片
            m = ac.val.match /<img [^>]*?src="(.+?)"[^>]*?\/?>/gi
            if m
              for url, k in m
                res.push
                  pos: pos,
                  type: 'image',
                  imgurl: url,
                  action: ac

          when 'state'
            # 状态图片
            if ac.stype is 'image'
              res.push
                pos: pos,
                type: 'image',
                imgurl: ac.val,
                action: ac

          when 'image'
            res.push
              pos: pos,
              type: 'image',
              imgurl: ac.val,
              action: ac

          when 'background'
            res.push
              pos: pos,
              type: 'image',
              imgurl: ac.val,
              action: ac

          when 'sound'
            res.push
              pos: pos,
              type: 'sound',
              soundid: ac.val,
              action: ac

      tt += _ctt

    res

  setVolume: (volume = -1) ->
    if volume is -1
      volume = GG.gekijou.tb.getVolume()
    _curev = @current()
    if _curev
      for ac in _curev.actions
        if ac.type is 'sound'
          if ac.sound
            ac.sound.setVolume volume
    return

  getClosetIndex: (time) ->
    tt = 0
    for ev, i in @events
      if tt > time
        return i - 1
      tt += ev.realtime()
    return @events.length - 1

  removeLine: (line) ->
    ev = @current()
    found = no

    if ev
      if ev.removeLine line
        found = on

    if not found
      for ev in @events
        if ev.removeLine line
          found = on

    found

  runAtTime: (time) ->
    tt = 0
    for ev, i in @events
      if time >= tt
        if @_currentIndex < i
          if @next()
            @run()
            GG.gekijou.emit 'step'
      else
        break
      tt += ev.realtime()

    # emit end message
    if time >= @_timecount and @_curtime < @_timecount
      GG.gekijou.emit 'end'

    @_curtime = time
    @_currentIndex

  runAll: ->
    self = @
    nextAndRun = ->
      if self.next()
        self.run nextAndRun
      else
        GG.gekijou.emit 'end'
      return

    nextAndRun()
    return

  run: (cb) ->
    if @_event
      self = @
      cbrun = ->
        self.setVolume()
        self._event.run cb
        return

      if @_status
        # 恢复背景乐等延续状态
        @_status.recover cbrun
        @_status = null
      else
        cbrun()

    return

  length: ->
    @events.length

  get: (i) ->
    @events[i]

  del: (i) ->
    @events.splice i, 1
    return

  insert: (name, time = 2000) ->
    if 0 <= @_currentIndex < @events.length - 1
      id = @_lastid++
      ev = new GEvent id, name, time
      @events.splice @_currentIndex + 1, 0, ev
      @_event = ev
      @_currentIndex++
      @_timecount += ev.realtime()
    else
      ev = @add name, time
    ev

  add: (name, time = 2000, id = -1) ->
    if id is -1
      id = @_lastid++
    else
      @_lastid = id + 1
    ev = new GEvent id, name, time
    @events.push ev
    @_event = ev
    @_currentIndex = @events.length - 1
    @_timecount += ev.realtime()
    ev

  # parse
  parse: (block_script) ->
    @_timecount = 0
    blocks = GG.util.splitblock block_script

    for b in blocks
      props = GG.util.splitprop b.title

      if props.length >= 4 and props[0] is 'define'
        id = parseInt props[1]
        name = JSON.parse props[2]
        time = parseInt props[3]
        ev = @add name, time, id
        ev.parse b.content

    return
