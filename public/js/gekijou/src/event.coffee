class GEvent

  constructor: (@id, @name, @time) ->
    @actions = []

  action: (type, val1, val2, norun) ->
    an = type: type

    switch type
      when 'text'
        an.line = index.mo.chatLine
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          @runAction an
      when 'image'
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          @runAction an, ->
            an.line = index.mo.chatLine - 1
            #image do some thing here
      else return

    @actions.push an
    return

  runAction: (action, cb) ->
    if GG.gekijou.isplaying()
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

  run: (i = 0) ->
    if i < @actions.length
      self = @
      @runAction @actions[i], ->
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
      # 特殊动作
      # do some thing

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
