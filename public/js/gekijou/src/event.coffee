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
      when 'image'
        img = new Image()
        img.onload = ->
          self.ready = on
          cb()
          return
        img.src = @val
        self.img = img
      when 'sound'
        moTool.getAjax
          url: "/sound/getsound?soundid=" + @val,
          showLoad: no,
          callBack: (data2) ->
            sound = data2.successVal.sound
            soundUrl = sound.soundurl
            s = soundManager.createSound
        					id: soundUrl,
        					url: index.mo.soundPath + soundUrl,
        					multiShot: no,
        					onload: ->
                    self.ready = on
                    cb()
                    return
            s.load()
            self.Jsound = sound
            self.sound = s
            return
      else
        cb()

    return

  run: (cb) ->
    action = @
    @load ->
      if action.chara and GG.gekijou.isplaying()
        # 切换角色
        GG.chara.select action.chara

      switch action.type
        when 'text'
          chatBox.loadBubble
            msg: action.val,
            type: 1,
            sender: index.mo.sender
          cb() if cb?
        when 'image'
          chatBox.loadBubble { msg: action.val, type: 7, sender: index.mo.sender }, ->
            cb() if cb?
            return
        when 'sound'
          msg = JSON.stringify action.Jsound

          # play sound
          chatBox.loadBubble
            msg: msg,
            type: 6,
            sender: index.mo.sender

          cb() if cb?

    return

class GEvent

  constructor: (@id, @name, @time) ->
    @actions = []

  action: (type, val1, val2, norun) ->
    an = new GAction type

    switch type
      when 'text'
        an.line = index.mo.chatLine
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          an.run()

      when 'image'
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          an.run ->
            an.line = index.mo.chatLine - 1
            #image do some thing here

      when 'sound'
        an.line = index.mo.chatLine
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          an.run ->
            # TODO: show some tips in stage

      else return

    @actions.push an
    return

  run: (i = 0) ->
    if i < @actions.length
      self = @
      @actions[i].run ->
        self.run i + 1
        return

    return

  parseCharaId: (charaid) ->
    if typeof charaid is 'number'
      return charaid
    else if typeof charaid is 'string'
      cids = charaid.split ':'
      if cids.length is 2 and cids[0] is 'chara'
        return parseInt cids[1]

    return -1

  # parse action text
  parseAction: (text) ->
    if text[0] isnt '/'
      @action 'text', GG.chara.current(), text
    else
      cmds = GG.util.splitcommand text
      switch cmds[0]
        when '声音'
          soundid = parseInt cmds[1]
          if soundid
            @action 'sound', GG.chara.current(), soundid
        # 其他特殊动作
        # do some thing

  showImage: (url) ->
    @action 'image', GG.chara.current(), url

  # parse
  parse: (block) ->
    lines = GG.util.splitline block

    if lines.length > 0
      for line in lines
        lineprops = GG.util.splitprop line
        try
          @action lineprops[0], lineprops[1], JSON.parse(lineprops[2]), on

    return

  realtime: () ->
    @time

class GEventManager

  constructor: () ->
    @events = []
    @_lastid = 0
    @_event = null
    @_timecount = 0
    @_currentIndex = -1

  lastid: ->
    @_lastid

  current: ->
    @_event

  next: ->
    if @_currentIndex < @events.length - 1
      @_currentIndex++
      @_event = @events[@_currentIndex]
      return on
    else
      return no

  totaltime: ->
    @_timecount

  moveToBegin: ->
    @_currentIndex = 0
    @_event = @events[0]
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
          when 'image'
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

  runAtTime: (time) ->
    tt = 0
    for ev, i in @events
      if time >= tt
        if @_currentIndex < i
          if @next() then @run()
        if time >= @_timecount
          GG.gekijou.emit 'end'
      else
        break
      tt += ev.realtime()

    @_currentIndex

  run: ->
    if @_event then @_event.run()
    return

  add: (name, time = 2000, id = -1) ->
    if id is -1
      id = @_lastid++
    else
      @_lastid = id + 1
    ev = new GEvent id, name, time
    @events.push ev
    @_event = ev
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
