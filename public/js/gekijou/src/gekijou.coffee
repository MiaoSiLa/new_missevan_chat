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
    @_playedtime = 0

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
    $('#chatbox').html ''
    @_finished = no
    @_playedtime = 0
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
      , 1000

    return

  emit: (event) ->
    @on event
    return

  on: (event) ->
    switch event
      when 'play'
        if @_finished
          @reset()
        if @_playing
          @pause()
        else
          @play()
      when 'end'
        @finish()
        if @opts.autoReplay
          @reset()
          @play()
    return

  autoReplay: (enable) ->
    @setOptions autoReplay: enable
    return

  play: ->
    if @_playing then return
    @_playing = on

    @pb.start()
    @_lastplaytime = new Date().valueOf()
    self = @

    @_timer = setInterval ->
        curtime = new Date().valueOf()
        self._playedtime += curtime - self._lastplaytime
        self._lastplaytime = curtime
        pos = self.em.runAtTime self._playedtime
        self.pb.pos pos
      , 100

    if @_playedtime <= 0
      @em.run()

    return

  pause: ->
    if @_playing
      @_playing = no
      clearInterval @_timer
      @_timer = 0
      @pb.pause()
    return

  finish: ->
    if @_playing
      @_playing = no
    if @_timer
      clearInterval @_timer
      @_timer = 0
    @_finished = on
    @pb.finish()
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
