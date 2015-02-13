class GEvent

  constructor: (@id, @name, @time) ->
    @actions = []

  action: (type, val) ->
    switch type
      when 'text'
        chatBox.loadBubble
          msg: val,
          type: 1,
          sender: index.mo.sender
      else return

    @actions.push type: type, val: val
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
