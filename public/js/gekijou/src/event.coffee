class GEvent

  constructor: (@id, @name, @time) ->
    @actions = []

  action: (type, val) ->
    an = type: type, val: val

    switch type
      when 'text'
        an.line = index.mo.chatLine
        an.chara = GG.chara.current()
        chatBox.loadBubble
          msg: val,
          type: 1,
          sender: index.mo.sender
      when 'image'
        an.chara = GG.chara.current()
        chatBox.loadBubble { msg: val, type: 7, sender: index.mo.sender }, ->
          an.line = index.mo.chatLine - 1
          #image do some thing here
      else return

    @actions.push an
    return

  # parse action text
  parseAction: (text) ->
    if text[0] isnt '/'
      @action 'text', text
    else
      # 特殊动作
      # do some thing

  # parse
  parse: (block) ->

class GEventManager

  constructor: () ->
    @events = []
    @_lastid = 0
    @_event = null

  lastid: () ->
    @_lastid

  current: () ->
    @_event

  add: (name, time = 2000) ->
    id = @_lastid++
    ev = new GEvent id, name, time
    @events.push ev
    @_event = ev
    ev
