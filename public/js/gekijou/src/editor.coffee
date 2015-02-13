###
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
###

class GekijouEditor
  constructor: (@gekijou) ->
    @eb = new Editorbar $('#inputbox'), @

  # stage & element init
  init: (cb) ->
    @eb.bind()

    @gekijou.setOptions env: 'dev'
    @gekijou.init () ->
      # editor init
      chatBox.addInfo '我是M娘', '欢迎使用小剧场编辑器'

      cb() if cb?
      return

    return
