###
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/12
###

class GekijouEditor
  constructor: (@gekijou) ->

  # stage & element init
  init: (cb) ->
    @gekijou.setOptions env: 'dev'
    @gekijou.init () ->
      # editor init
      chatBox.addInfo '我是M娘', '欢迎使用小剧场编辑器'
