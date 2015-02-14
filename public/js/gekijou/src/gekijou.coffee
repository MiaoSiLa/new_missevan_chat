###
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
###

class Gekijou

  constructor: (@opts = {}) ->
    @pb = new Playbar $ '#m'
    @tb = new Toolbar $ '#common-toolbar'
    @chara = new Chara $ '#chara-toolbar'
    @em = new GEventManager()
    @util = new Util()

    @_playing = no
    @_ready = no

    # 全局管理器
    window.GG = new GGManager()
    GG.gekijou = @
    GG.chara = @chara
    GG.em = @em
    GG.util = @util

  setOptions: (opts) ->
    for k, v of opts
      # set env to GG
      if k is 'env'
        GG.env = v
      @opts[k] = v
    @opts

  # stage & element init
  init: (cb) ->
    chatBox.loadChatOption()
    chatBox.loadUser()

    if not chatBox.isMobile
      index.js.loadChatDm()

    # binding bars
    @pb.bind()
    @tb.bind()

    @util.init()

    # script
    gs = $ 'script#gekijouscript'
    script = ''
    if gs and gs.length > 0
      @parse gs.html()

    @chara.init -> cb() if cb?
    return

  # 重新排布播放条
  rearrange: ->
    @pb.clear()

    timecount = 0
    for e in @em.events
      timecount += e.time

    pns = []
    cur = 0
    for e in @em.events
      pns.push id: e.id, pos: cur / timecount, name: e.name
      cur += e.time

    if pns.length is 1
      pns[0].pos = 0.5

    @pb.data pns
    @pb.moveToLast()

    return

  # parse
  parse: (script) ->
    script = script.trim() if script
    if script
      blocks = @util.splitblock script
      for b in blocks
        if b.title is 'chara'
          @chara.parse b.content

      for b in blocks
        if b.title is 'event'
          @em.parse b.content

      @chara.select 0

      @rearrange()

    return

  reset: ->
    @em.moveToBegin()
    @pb.moveToBegin()
    return

  # 预加载
  preload: (cb) ->
    self = @
    setTimeout ->
        self._ready = on
        cb()
        return
      , 2000

    return

  play: ->
    if @_playing then return
    @_playing = on

    return

  run: ->
    self = @
    setTimeout ->
        moTool.showModalBox $('#loadmodal'), { showClose: false }
        # 预加载
        self.preload ->
          moTool.hideModalBox $('#loadmodal')
          self.play()
      , 100
    return
