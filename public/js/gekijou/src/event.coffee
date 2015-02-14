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
          chatBox.loadBubble
            msg: val2,
            type: 1,
            sender: index.mo.sender
      when 'image'
        an.chara = @parseCharaId(val1)
        an.val = val2
        if not norun
          chatBox.loadBubble { msg: val2, type: 7, sender: index.mo.sender }, ->
            an.line = index.mo.chatLine - 1
            #image do some thing here
      else return

    @actions.push an
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

class GEventManager

  constructor: () ->
    @events = []
    @_lastid = 0
    @_event = null

  lastid: ->
    @_lastid

  current: ->
    @_event

  moveToBegin: ->
    @_event = @events[0]
    return

  add: (name, time = 2000, id = -1) ->
    if id is -1
      id = @_lastid++
    ev = new GEvent id, name, time
    @events.push ev
    @_event = ev
    ev

  # parse
  parse: (block_script) ->
    blocks = GG.util.splitblock block_script

    for b in blocks
      props = GG.util.splitprop b.title
      lines = GG.util.splitline b.content

      if props.length >= 4 and props[0] is 'define'
        id = parseInt props[1]
        name = JSON.parse props[2]
        time = parseInt props[3]
        ev = @add name, time, id

        if lines.length > 0
          for line in lines
            lineprops = GG.util.splitprop line
            try
              ev.action lineprops[0], lineprops[1], JSON.parse(lineprops[2]), on


    return
