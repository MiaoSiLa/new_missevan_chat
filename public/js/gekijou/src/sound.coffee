
class SoundCollection
  constructor: ->
    @_soundurlmap = {}
    @_bmute = off

  init: (cb) ->
    # 初始化 soundManager
    soundManager.onready ->
      if play.soundBox
        # disable chat sound effect
        play.soundBox.playChat = -> off
      cb() if cb?
      return

  get: (soundid, cb) ->
    url = "/api/sound/getsound?soundid=" + soundid
    $.ajax
      url: url,
      dataType: 'json',
      success: (data) ->
        cb(data);
        return
    return

  load: (url, cb) ->
    soundUrl = url
    s = soundManager.createSound
					id: soundUrl,
					url: index.mo.soundPath + soundUrl,
					multiShot: no,
					onload: ->
            cb() if cb?
            return
    s.load()
    s

  stopAll: (nobg = off) ->
    if nobg
      for k of @_soundurlmap
        if k isnt 'background'
          url = @_soundurlmap[k]
          if url
            s = soundManager.getSoundById url
            if s then s.stop()
    else
      soundManager.stopAll()

  pauseAll: ->
    soundManager.pauseAll()

  resumeAll: ->
    soundManager.resumeAll()

  mute: (@_bmute) ->
    if @_bmute then @stopAll()
    return

  play: (soundkey, url, cb) ->
    prevUrl = @_soundurlmap[soundkey]
    if prevUrl
      s = soundManager.getSoundById prevUrl
      if s then s.stop()
    if url is 'stop' or not url
      @_soundurlmap[soundkey] = null
      return
    if @_bmute
      # 被静音
      @_soundurlmap[soundkey] = null
    else
      @_soundurlmap[soundkey] = url
      s = soundManager.getSoundById url
      if s
        opts = {}
        if soundkey is 'background'
          # looping sound
          opts.onfinish = ->
            s.play opts
        s.play opts
    cb() if cb?
    return

  stop: (soundkey) ->
    prevUrl = @_soundurlmap[soundkey]
    if prevUrl
      s = soundManager.getSoundById prevUrl
      if s then s.stop()
      @_soundurlmap[soundkey] = null
    return
