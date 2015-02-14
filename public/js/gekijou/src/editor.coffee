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
    @_id = @eb.getId()

    @gekijou.setOptions env: 'dev'
    @gekijou.init () ->
      # editor init
      chatBox.addInfo '我是M娘', '欢迎使用小剧场编辑器'

      cb() if cb?
      return

    return

  generate: () ->
    return

  setId: (@_id) ->
    @eb.setId @_id
    return

  # 保存
  save: (title, intro, cb) ->

    self = @

    vgeki =
      title: title,
      intro: intro,
      script: @generate()
    vgeki._id = @id if @_id

    moTool.postAjax
      url: '/gekijou/save',
      value: vgeki,
      callBack: (data) ->
        geki = null
        if data
          if data.code is 0
            # 保存成功
            geki = data.gekijou
            if geki && geki._id
              self.setId geki._id
          else if data.message
            moTool.showError data.message
          else
            moTool.showError '未知错误'

        cb(geki) if cb?
        return
      ,
      showLoad: true,
      success: false,
      error: false,
      json: false

    return
