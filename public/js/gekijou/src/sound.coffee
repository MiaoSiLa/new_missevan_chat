
class SoundCollection
  constructor: ->
    @_soundurlmap = {}

  init: (cb) ->
    # 初始化 soundManager
    soundManager.onready -> cb() if cb?

  stopAll: ->
    soundManager.stopAll()

  pauseAll: ->
    soundManager.pauseAll()

  resumeAll: ->
    soundManager.resumeAll()

  play: (soundkey, url, cb) ->
    prevUrl = @_soundurlmap[soundkey]
    if prevUrl
      s = soundManager.getSoundById prevUrl
      if s then s.stop()
    if url is 'stop' or not url
      @_soundurlmap[soundkey] = null
      return
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
