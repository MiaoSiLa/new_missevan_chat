###
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/12
###

class Gekijou

  constructor: (@opts = {}) ->
    @pb = new Playbar $ '#m'
    @tb = new Toolbar $ '#toolbar'

  setOptions: (opts) ->
    for k, v of opts
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

    cb()
    return

  # parse
  parse: (scripts) ->
