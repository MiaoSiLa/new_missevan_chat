###
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
###

class Gekijou

  constructor: (@opts = {}) ->
    @bubble = new ChatBubble()

    @pb = new Playbar $ '#m'
    @tb = new Toolbar $ '#common-toolbar'
    @chara = new Chara $ '#chara-toolbar'
    @album = new SoundAlbum()
    @sound = new SoundCollection()
    @em = new GEventManager()
    @util = new Util()
    #@settings = {}

    @_playing = no
    @_ready = no
    @_playedtime = 0

    # 全局管理器
    new GGManager()
    GG.gekijou = @
    GG.opts = @opts
    GG.bubble = @bubble
    GG.chara = @chara
    GG.album = @album
    GG.sound = @sound
    GG.em = @em
    GG.util = @util

  setOptions: (opts) ->
    for k, v of opts
      @opts[k] = v

      switch k
        when 'env'
          # set env to GG
          GG.env = v
        when 'showname'
          @bubble.showname v
        when 'instantshow'
          # 开启静音
          @sound.mute v
          @tb.refresh()
          if @opts['env'] isnt 'dev'
            # 隐藏播放条
            @pb.show not v
        when 'editormode'
          @setOptions instantshow: (v is 'simple')

    @opts

  initChatBox: ->
    # new style chatbox
    @bubble.init()

    chatBox.loadChatOption()
    chatBox.loadUser()
    # override old func
    chatBox.insertPrivateBox = ->
      return

    if not chatBox.isMobile
      index.js.loadChatDm()
    return

  initUser: ->
    $user = $('#user')

    if not ($user and $user.length > 0)
      return

    @status = $user.data 'status'
    suser = $user.data 'user'

    if suser and typeof suser is 'object'
      GG.user = suser

    return

  # stage & element init
  init: (cb) ->
    @initUser()
    @initChatBox()

    # binding bars
    @pb.bind()
    @tb.bind()

    @album.init()

    @util.init()

    # script
    gs = $ 'script#gekijouscript'
    script = ''
    if gs and gs.length > 0
      @setId gs.data 'id'
      script = @util.unescape gs.text()
      @parse script

    self = @
    @chara.init ->
      # 初始化声音管理
      self.sound.init -> cb() if cb?
      return
    return

  # 重新排布播放条
  rearrange: (keep = no) ->
    @pb.clear()

    pns = @em.calc()
    @pb.data pns

    if keep
      i = @em.currentIndex()
      if i >= 0
        @pb.moveToIndex i
        return

    if GG.env isnt 'dev'
      @pb.moveToBegin()
    else
      len = @em.length()
      if len > 0
        @moveTo len - 1

    return

  # parse
  parse: (script) ->
    script = script.trim() if script
    if script
      blocks = @util.splitblock script
      for b in blocks
        if b.title is 'setup'
          # parse setup
          @parseSetup b.content

      for b in blocks
        if b.title is 'chara'
          @chara.parse b.content

      for b in blocks
        if b.title is 'event'
          @em.parse b.content

      @chara.select 0
      # album just need async load
      @album.load()

      @rearrange()

    return

  parseSetup: (block) ->
    lines = @util.splitline block
    for line, i in lines
      lineprops = @util.splitprop line
      switch lineprops[0]
        when 'album'
          @album.set lineprops[1]
        when 'showname', 'instantshow', 'bgm_sync'
          opt = {}
          if lineprops[1] is 'off'
            opt[lineprops[0]] = off
            @setOptions opt
          else if lineprops[1] is 'on'
            opt[lineprops[0]] = on
            @setOptions opt
    return

  reset: ->
    @bubble.reset()
    @_finished = no
    @_playedtime = 0
    @em.moveToBegin()
    @pb.moveToBegin()
    return

  ready: ->
    @_ready = on
    $('#chatmain').addClass 'gekijou-ready'
    return

  # 预加载
  preload: (cb) ->
    res = @em.getNeedPreload()
    if res.length <= 0
      @pb.preload 1
      @ready()
      cb() if cb?
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
        self.ready()
        cb() if cb?
    return

  moveTo: (i) ->
    self = @
    curIndex = @em.currentIndex()
    @reset()
    @pb.moveToIndex i
    @em.current curIndex
    @sound.stopAll on
    @em.switchTo i
    @played i
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
      when 'next'
        if not @_finished
          @playNext()
      when 'step'
        @scrollToBottom()
      when 'pos'
        i = @em.getClosetIndex val * @em.totaltime()
        if i >= 0
          if @_playing
            @pause()
          @moveTo i
          @play()
      when 'end'
        @finish()
        if @opts.autoReplay
          self = @
          setTimeout ->
              self.reset()
              self.play()
            , 0
    return

  autoReplay: (enable) ->
    @setOptions autoReplay: enable
    return

  playNext: ->
    if @em._currentIndex < @em.events.length - 1
      @played @em._currentIndex + 1
    return

  isplaying: ->
    @_playing

  isfinished: ->
    @_finished

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

    if @opts['instantshow'] and @opts['env'] isnt 'dev'
      # 全部展示
      @sound.resumeAll()
      @em.runAll()
    else
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

      @sound.resumeAll()

    return

  pause: ->
    if @_playing
      @_playing = no
      clearInterval @_timer
      @_timer = 0
      @pb.pause()
      @sound.pauseAll()
    return

  finish: ->
    if @_finished then return

    if @_timer
      clearInterval @_timer
      @_timer = 0

    @_playing = no
    @_finished = on

    @sound.stopAll()
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

  scrollToBottom: ->
    @bubble.tobottom()
    return
