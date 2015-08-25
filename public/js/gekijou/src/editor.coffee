###
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
###

class GekijouEditor
  constructor: (@gekijou, @mode = 'default') ->
    @eb = new Editorbar $('#inputbox'), @
    @af = new ActionForm()
    GG.editor = @

  # stage & element init
  init: (cb) ->
    self = @

    @eb.bind()
    @af.bind()
    @_id = @eb.getId()

    @gekijou.setOptions env: 'dev'
    if @mode is 'simple'
      @gekijou.setOptions editormode: 'simple'

    @gekijou.init () ->
      # editor init
      self.gekijou.preload()
      chatBox.addInfo '我是M娘', '欢迎使用小剧场编辑器'

      cb() if cb?
      return

    return

  generate: () ->
    chara = @gekijou.chara
    em = @gekijou.em
    album = @gekijou.album

    script = ''
    script = 'setup {\n'

    # ref gekijou this
    # script += "  gekijou #{refgekijou._id}\n"
    # and other setup

    if album.albums and album.albums.length
      script += "  album " + album.albums.join() + "\n"

    if @gekijou.opts['showname'] is off
      script += "  showname off\n"
    if @gekijou.opts['instantshow'] is on
      script += "  instantshow on\n"
    if @gekijou.opts['bgm_sync'] is on
      script += "  bgm_sync on\n"
    if @gekijou.opts['editormode'] is 'simple'
      script += "  editormode simple\n"

    script += '}\n\n'
    script += 'chara {\n'

    # chara
    for c in chara.charas
      script += "  define #{c.id} #{JSON.stringify(c.username)} {\n"
      script += "    actor #{c.iconid}\n"
      script += "    icon #{JSON.stringify(c.iconurl)}"
      if c.iconcolor
        script += ' ' + JSON.stringify(c.iconcolor)
      script += "\n"
      if c.subtitle
        script += "    subtitle #{JSON.stringify(c.subtitle)}\n"
      if c.showon is 'right'
        script += "    showon right\n"
      script += "  }\n"

    script += '}\n\n'
    script += 'event {\n'

    # TODO: effect
    # add effect define

    # event
    for e in em.events
      script += "  define #{e.id} #{JSON.stringify(e.name)} #{JSON.stringify(e.time)} {\n"

      for a in e.actions
        # 无角色图片修改为 state 指令
        if a.chara is -1 and a.type is 'image'
          a.type = 'state'
          a.stype = 'image'

        script += "    #{a.type} "

        switch a.type
          #when 'unknow'
            # some other types
          when 'background'
            script += "\"#{a.effect}\" #{JSON.stringify(a.val)}"
          when 'state'
            if a.stype is 'text'
              charastr = if a.chara is -1 then 'nochara' else "chara:#{a.chara}"
              script += "text #{charastr} "
            else
              script += "image "
            script += JSON.stringify a.val
          when 'sound'
            charastr = if a.chara is -1 then a.stype else "chara:#{a.chara}"
            script += "#{charastr} #{JSON.stringify(a.val)}"
          else
            # text, image, sound
            charastr = if a.chara is -1 then 'nochara' else "chara:#{a.chara}"
            script += "#{charastr} #{JSON.stringify(a.val)}"

        script += "\n"
      script += "  }\n"

    script += '}\n'

    script

  setId: (@_id) ->
    @eb.setId @_id
    return

  # 删除
  delete: (cb) ->
    self = @

    vgeki =
      _id: @_id

    moTool.postAjax
      url: '/gekijou/delete',
      value: vgeki,
      callBack: (data) ->
        success = off
        success = data.code is 0 if data
        if success
          moTool.showError '删除成功'
        else if data.message
          moTool.showError data.message
        else
          moTool.showError '删除失败'
        cb(success) if cb?
        return
      ,
      showLoad: true,
      success: false,
      error: false,
      json: false

    return

  # 保存
  save: (title, intro, cb) ->

    self = @

    vgeki =
      title: title,
      intro: intro,
      script: @generate()
    vgeki._id = @_id if @_id

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
