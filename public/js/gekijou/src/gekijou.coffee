###
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
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
    new GGManager()
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
      @setId gs.data 'id'
      script = @unescape gs.text()
      @parse script

    @chara.init ->
      # 初始化 soundManager
      soundManager.onready -> cb() if cb?
      return
    return

  # 重新排布播放条
  rearrange: (keep = no) ->
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

    if keep
      i = @em.currentIndex()
      if i >= 0
        @pb.moveToIndex i
        return

    if GG.env is 'dev'
      @pb.moveToLast()
    else
      @pb.moveToBegin()

    return

  unescape: (script) ->
    script.replace(/&(#0?34|quot);/g, '"').replace(/&#0?39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

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
    res = @em.getNeedPreload()
    if res.length <= 0
      @pb.preload 1
      @_ready = on
      cb()
    else
      self = @
      preload_step = (i, cb2) ->
        if i >= res.length
          cb2()
        else
          res[i].action.load ->
            self.pb.preload res[i].pos
            preload_step i + 1, cb2

      preload_step 0, ->
        self.pb.preload 1
        self._ready = on
        cb()
    return

  moveTo: (i) ->
    @pb.moveToIndex i
    @em.current i
    @played i
    soundManager.stopAll()
    @em.run()
    return

  emit: (event, val) ->
    @on event, val
    return

  on: (event, val) ->
    switch event
      when 'pause'
        # only pause
        if @_playing
          @pause()
      when 'play'
        if @_playing
          @pause()
        else
          if @_finished
            # or GG.env is 'dev'
            @reset()
          @play()
      when 'pos'
        i = @em.getClosetIndex val * @em.totaltime()
        if i >= 0
          if @_playing
            @pause()
          @reset()
          @moveTo i
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

  isplaying: ->
    return @_playing

  played: (i) ->
    @_playedtime = @em.totaltime i
    if @_playedtime <= 0
      @_playedtime = 1

  play: (untilIndex = -1) ->
    if @_playing then return
    @_playing = on
    @_finished = no

    @pb.start()
    @_lastplaytime = new Date().valueOf()
    self = @

    @_timer = setInterval ->
        curtime = new Date().valueOf()
        self._playedtime += curtime - self._lastplaytime
        self._lastplaytime = curtime
        i = self.em.runAtTime self._playedtime

        pos = self._playedtime / self.em.totaltime()
        if pos > 1 then pos = 1
        self.pb.pos pos

        if i is untilIndex
          self.pause()
      , 100

    if @_playedtime <= 0
      @em.run()

    soundManager.resumeAll()
    return

  pause: ->
    if @_playing
      @_playing = no
      clearInterval @_timer
      @_timer = 0
      @pb.pause()
      soundManager.pauseAll()
    return

  finish: ->
    if @_finished then return

    if @_timer
      clearInterval @_timer
      @_timer = 0

    @_playing = no
    @_finished = on

    @pb.finish()

    if GG.env isnt 'dev'
      # 增加播放次数
      moTool.postAjax
        url: "/gekijou/addplaytimes",
        value: { _id: @_id },
        callBack: (data) ->
          return
        ,
        showLoad: false,
        success: false,
        error: false,
        json: false
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

  setId: (@_id) ->
    return
