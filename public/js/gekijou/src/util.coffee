
# base session

class Util

  init: ->
    if not String::trim
      String::trim = ->
        return $.trim this

      return

  escape: (str) ->
    str.replace(/&/g,'&amp;' ).replace(/</g,'&lt;').replace(/>/g,'&gt;').
      replace(/"/g,'&quot;').replace(/'/g,'&#039;')

  unescape: (str) ->
    str.replace(/&(#0?34|quot);/g, '"').replace(/&#0?39;/g, '\'').
      replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

  findquoteend: (script, start) ->
    end = -1
    i = start
    len = script.length
    d = script[i] is '\"'

    i++
    while i < len
      if script[i] is '\\'
        i++
        switch script[i]
          when 'u'
            # \uXXXX
            i += 5
          when 'x'
            # \xXX
            i += 3
          else
            # \n ...
            i++
      else if (d and script[i] is '\"') or (not d and script[i] is '\'')
        end = i
        break
      else
        i++

    end

  findblockend: (script, start) ->
    end = -1
    i = start
    len = script.length
    while i < len
      if script[i] is '\'' or script[i] is '\"'
        i = @findquoteend script, i
        if i is -1
          break
      else if script[i] is '{'
        i = @findblockend script, i + 1
        if i is -1
          break
      else if script[i] is '}'
        end = i
        break

      i++

    end

  splitblock: (script) ->
    blocks = []

    i = 0
    while on
      ti = script.indexOf('{', i)
      if ti >= 0
        title = script.substring i, ti
        ti++
        ti2 = @findblockend script, ti
        if ti2 >= 0
          content = script.substring ti, ti2
          blocks.push title: title.trim(), content: content
          i = ti2 + 1
        else
          break
      else
        break

    blocks

  splitprop: (script) ->
    props = []

    script = script.trim()

    if script
      i = 0
      iend = -1
      len = script.length
      blank = /\s/
      while i < len
        if script[i] is '\"' or script[i] is '\''
          iend = @findquoteend script, i
          if iend is -1
            break
          iend++
        else if blank.test script[i]
          i++
          continue
        else
          iend = i + 1
          found = no
          while iend < len
            if blank.test script[iend]
              found = on
              break
            iend++

        props.push script.substring i, iend
        i = iend

    props

  splitline: (script) ->
    lines = []
    _lines = script.split '\n'

    for line in _lines
      l = line.trim()
      lines.push l if l

    lines

  splitsubcommand: (key, val) ->
    subcmds =
      'sound':
        'chara': ['chara', '角色', '人物'],
        'effect': ['effect', '音效'],
        'background': ['background', 'bgm', '背景乐']
    for ckey, cscmd of subcmds
      if key is ckey
        # subcmd
        text = val
        for subkey, clist of cscmd
          for subcmdname in clist
            if text.substr(0, subcmdname.length).toLowerCase() is subcmdname
              val = text.substr(0 + subcmdname.length).trim()
              return [key, subkey, val]
    [key, val]

  splitcommand: (text) ->
    cmdlist =
      'sound': ['sound', '声音', '音频'],
      'album': ['album', '专辑']
      'state': ['state', '状态']

    cmds = null

    if text[0] is '/'
      for key, clist of cmdlist
        for cmdname in clist
          if text.substr(1, cmdname.length).toLowerCase() is cmdname
            val = text.substr(1 + cmdname.length).trim()
            cmds = @splitsubcommand key, val
            return cmds
    cmds

class GGManager

  constructor: ->
    window.GG = @


# Image Tools

class ImageTools

  callback: ->
    moTool.hideModalBox @modal
    if @result and @result.code is 0
      @cb null, @type(), @result.url
    #else
    #  @cb 'failed'
    return

  isextend: ->
    $('#inputbox').hasClass 'full-editor'

  progress: (str) ->
    @modal.find('#img_upload_progress').text str
    return

  type: ->
    @modal.find('input[type=radio]:checked').val()

  initImageUpload: (@cb) ->
    self = @
    dz = $ '#chattop'
    el = dz

    modal = $ '#imagemodal'
    @modal = modal
    modal.find('#imageokbtn').click ->
      if not $(this).hasClass('pending')
        self.callback()
      return

    input = $ '#imagefile input', el
    # show process
    input.bind 'fileuploadprogress', (e, data) ->
      # Log the current bitrate for this upload:
      p = data.progress()
      if p.loaded is p.total
        self.progress '上传完成'
      else
        strp = (p.loaded * 100 / p.total).toFixed(1)
        self.progress strp + '%'
      return

    input.fileupload
      url: 'http://backend1.missevan.cn/mimage/chatimage',
      dropZone: dz,
      dataType: 'json',
      multipart: true,
      add: (e, data) ->
        self.result = null
        curev = GG.em.current()
        if curev
          self.progress '0%'
          modal.find('#imageokbtn').addClass 'pending'
          #modal.find('#editevent_time').val ev.time
          moTool.showModalBox modal
          data.submit().error ->
            self.progress '错误'
            return
        else
          moTool.showError '请先新建一个事件！'
        return
      done: (e, data) ->
        if data and data.result
          result = data.result
          self.result = data.result
          if result.code isnt 0
            self.progress '错误'
          else
            self.progress '加载中'
            img = new Image()
            img.onload = ->
              self.progress '完成'
              modal.find('#imageokbtn').removeClass 'pending'
            img.src = result.url
        return

    $(document).bind 'dragover', (e) ->
      dropZone = dz
      timeout = window.dropZoneTimeout

      if not timeout
        dropZone.addClass 'in'
      else
        clearTimeout timeout

      found = no
      node = e.target

      while node
        if node is dropZone[0]
          found = on
          break
        node = node.parentNode

      if found
        dropZone.addClass 'hover'
      else
        dropZone.removeClass 'hover'

      window.dropZoneTimeout = setTimeout ->
          window.dropZoneTimeout = null;
          dropZone.removeClass 'in hover'
        , 100

    $('#fileuploadbtn', el).click ->
      $('#imagefile input', el).click();


# Control bar session

class ControlBar
  constructor: (@el) ->

  $: (selector) ->
    @el.find selector

  bind: ->


# 分页工具
class Paginationbar extends ControlBar

  constructor: (@el) ->
    super @el

  update: (page, pagecount) ->
    $pagelist = @el
    @p = page
    if pagecount?
      @pagecount = pagecount
    else
      pagecount = @pagecount

    if page and pagecount
      # first, previous
      if page is 1
        $pagelist.find('.first, .previous').addClass('hidden')
      else
        $pagelist.find('.first').data 'page', 1
        $pagelist.find('.previous').data 'page', page - 1
        $pagelist.find('.first, .previous').removeClass('hidden')

      # next, last
      if page >= pagecount
        $pagelist.find('.next, .last').addClass('hidden')
      else
        $pagelist.find('.next').data 'page', page + 1
        $pagelist.find('.last').data 'page', pagecount
        $pagelist.find('.next, .last').removeClass('hidden')

      $pagelist.find('> li').removeClass 'selected'

      $pages = $pagelist.find '.page'
      if pagecount <= 5
        for pa, i in $pages
          $(pa).data 'page', i + 1
          if i + 1 is page
            $(pa).addClass 'selected'
          if i >= pagecount
            $(pa).addClass 'hidden'
          else
            $(pa).removeClass 'hidden'
      else
        $pages.removeClass 'hidden'
        pagenum = []
        if page < 3
          pagenum = [1..5]
        else if pagecount - 2 <= page <= pagecount
          pagenum = [pagecount - 4 .. pagecount]
        else
          pagenum = [page - 2 .. page + 2]

        for pa, i in $pages
          if pagenum[i] is page
            $(pa).addClass 'selected'
          $(pa).data('page', pagenum[i]).find('a').text(pagenum[i])


      $pagelist.show()
    else
      $pagelist.hide()

    return

  change: (cb) ->
    self = @
    @$('> li').click ->
      $this = $(this)
      if not $this.hasClass 'selected'
        self.$('> li.selected').removeClass 'selected'
        $this.addClass 'selected'
        cb()
      return
    return

  page: (p) ->
    if p?
      if p isnt @page
        @update p, @pagecount
      return
    p = @$('.selected').data 'page'
    parseInt p

class Playbar extends ControlBar

  constructor: (@el) ->
    super @el
    @_data = []
    @_wheelstatus = {}

  show: (bshow) ->
    if bshow
      @el.show()
    else
      @el.hide()
    return

  bind: ->
    @$('.mpi').click ->
      GG.gekijou.emit 'play'
      return

    @$('.mpfo').click (e) ->
      pos = 1 - e.offsetY / $(this).height()
      GG.gekijou.emit 'pos', pos
      return

    $mpo = @$ '.mpo'
    @$('.mplr').draggable
      axis: 'y',
      containment: $mpo,
      drag: ->
        GG.gekijou.emit 'pause'
        return
      ,
      stop: ->
        $this = $(this)
        y = $this.offset().top
        py = $mpo.offset().top
        h = $mpo.height()
        ypos = h - (y - py)
        $this.attr 'style', ''
        GG.gekijou.emit 'pos', ypos / h
        return

    if GG.env isnt 'dev'
      @$('.mpiloopo').click ->
        $this = $(this)
        if $this.hasClass 'mpiloopa'
          GG.gekijou.autoReplay no
          $this.removeClass 'mpiloopa'
        else
          GG.gekijou.autoReplay on
          $this.addClass 'mpiloopa'
        return

      # 播放中的按键
      $(document).keydown (e) ->
        switch e.which
          when 32
            # space
            GG.gekijou.emit 'play'
          when 38
            # up
            GG.gekijou.emit 'pause'
          when 40
            # down
            if GG.gekijou.isplaying() and GG.bubble.isbottom()
              # need jump next
              GG.gekijou.emit 'next'
              return
        return

      # 滚动条事件
      #$('#commentCanvas').scroll (e) ->
      #  console.log @scrollTop
      #  return
      if chatBox.isMobile
        @bindMobile()
      else
        @bindDesktop()


    return

  bindDesktop: ->
    # TODO: firefox
    self = @
    #$('#commentCanvas')[0].addEventListener 'DOMMouseScroll', (e) ->
    $('#commentCanvas')[0].onmousewheel = (e) ->
      wheeltype = off
      if e.deltaY < 0
        wheeltype = 'up'
      else if e.deltaY > 0
        wheeltype = 'down'

      if wheeltype
        if self._wheelstatus.type isnt wheeltype \
        or new Date().valueOf() - self._wheelstatus.lasttime > 800
          self._wheelstatus =
            type: wheeltype,
            lasttime: new Date().valueOf(),
            deltaY: 0,
            tigger: off
        else
          self._wheelstatus.deltaY += e.deltaY
          self.onscroll()

        #self._lastwheeltime
      # console.log e.detail, e.deltaY
      return

    return

  bindMobile: ->
    self = @
    document.addEventListener 'touchstart', (e) ->
        # touchmove
        self._wheelstatus =
          touches: e.touches[0]
      , off
    document.addEventListener 'touchend', (e) ->
        # touchmove
        deltaY = self._wheelstatus.touches.clientY - e.changedTouches[0].clientY
        self._wheelstatus =
          tigger: off,
          deltaY: deltaY
        self.onscroll()
      , off
    return

  onscroll: ->
    if not @_wheelstatus.tigger
      if @_wheelstatus.deltaY < -10
        # up
        @_wheelstatus.tigger = on
        if GG.gekijou.isplaying()
          GG.gekijou.emit 'pause'

      else if @_wheelstatus.deltaY > 10
        # down
        if GG.bubble.isbottom()
          if not GG.gekijou.isplaying()
            @_wheelstatus.tigger = on
            if not GG.gekijou.isfinished()
              GG.gekijou.emit 'play'
          else if @_wheelstatus.deltaY > 100
            # playnext
            @_wheelstatus.tigger = on
            GG.gekijou.emit 'next'
    return


  # 预加载 0~1
  preload: (p) ->
    p *= 100
    @$('.mppl').css 'height', "#{p}%"

  # 进度位置
  pos: (p) ->
    p *= 100
    @$('.mpl').css 'height', "#{p}%"

  clear: ->
    @$('.mpfs').html ''

  data: (pns) ->
    html = ''

    for pn, i in pns
      pos = 100 - pn.pos * 100
      name = GG.util.escape pn.name
      html += """
              <div id=\"event#{pn.id}\" class="mpf" style="top: #{pos}%;">
                <div class="mpfl"></div>
              """
      # 非开发模式下不显示事件名
      if GG.env is 'dev'
        html += "<div data-event-index=\"#{i}\" class=\"mpfi\"><span>#{name}</span></div>"

      html += "</div>"

    @$('.mpfs').html html
    @_data = pns

    if GG.env is 'dev'
      # bind click event
      self = @
      evlabels = @$ '.mpfi'
      evlabels.click (e) ->
        i = $(this).data 'event-index'
        if i >= 0
          # need keep current chara
          charaId = GG.chara.currentId()

          if GG.gekijou.isplaying()
            GG.gekijou.pause()
          GG.gekijou.reset()

          # only play this event
          GG.gekijou.moveTo i

          if GG.chara.currentId() isnt charaId
            GG.chara.selectId charaId

        e.stopPropagation()
        return

      evlabels.dblclick (e) ->
        i = $(this).data 'event-index'
        if i >= 0
          ev = GG.em.get i
        if ev
          modal = $ '#editeventmodal'
          modal.data 'event-index', i
          modal.find('#editevent_name').val ev.name
          modal.find('#editevent_time').val ev.time
          moTool.showModalBox modal
        e.stopPropagation()
        return

    return

  moveToIndex: (i) ->
    if 0 <= i < @_data.length
      @pos @_data[i].pos
    return

  moveToLast: ->
    if @_data.length > 0
      [..., l] = @_data
      @pos l.pos
    return

  moveToBegin: ->
    @pos 0
    return

  start: ->
    @$('.mpi').removeClass('mpir').addClass('mpip')
    return

  pause: ->
    @$('.mpi').removeClass('mpir').removeClass('mpip')
    return

  finish: ->
    @$('.mpi').removeClass('mpip').addClass('mpir')
    return


class Toolbar extends ControlBar

  constructor: (@el) ->
    super @el
    @_display =
      dm: on
      sv: no
      f: no

  display: (item, newvalue) ->
    if newvalue?
      @_display[item] = newvalue

    @_display[item]

  switch: (item) ->
    @_display[item] = not @_display[item]

  setVolume: (volume) ->
    @$('.mpsvbl').css 'width', volume

    # 静音图标
    if volume > 0
      @$('.mpsv').removeClass 'mpsvc'
    else
      @$('.mpsv').addClass 'mpsvc'

    @_volume = volume
    store.set 'volume', volume
    GG.em.setVolume volume
    return

  getVolume: ->
    @_volume

  initVolume: ->
    volume = parseInt store.get('volume')
    if not volume or volume isnt 0
      volume = 100

    @$('.mpsvblr').css 'left', (100 - volume) / 100 * 88
    @$('.mpsvbl').css 'width', volume
    @_volume = volume

    return

  initStatus: ->
    status = GG.gekijou.status
    if not status
      return

    if status.good
      @$('.mpcz').addClass 'btnzg'
    if status.favorite
      @$('.mpcs').addClass 'mpcsg'
    return

  bind: ->
    self = @

    @initVolume()
    @initStatus()

    @$('.mpsv').click ->
      if self.switch('sv')
        $(@).find('.mpsvo').show()
      else
        $(@).find('.mpsvo').hide()
      return

    $mpsvblClass = @$ '.mpsvbl'
    $mpsvblrClass = @$ '.mpsvblr'

    updateVolume = ->
      x = $mpsvblrClass.offset().left
      px = $mpsvblrClass.parent().offset().left
      xpos = x - px
      volume = (100 - xpos - 12) * 100 / 88
      self.setVolume volume
      return

    $mpsvblrClass.draggable
        axis: 'x',
        containment: 'parent',
        drag: (e) ->
          updateVolume()
          return
        ,
        stop: ->
          updateVolume()
          return

    $mpsvblClass.click (e) ->
      offsetX = e.offsetX + 100 - $mpsvblClass.width()
      $mpsvblrClass.css 'left', (offsetX / 100 * 88)
      self.setVolume (100 - offsetX)
      e.stopPropagation()
      return
    $mpsvblrClass.click (e) ->
      e.stopPropagation()
      return

    @$('.mpsvo').click (e) ->
      $mpsvblrClass.css 'left', (e.offsetX / 100 * 88)
      self.setVolume (100 - e.offsetX)
      e.stopPropagation()
      return

    ### Deprecated: danmaku button
    @$('.mpcdm').click ->
      if self.switch('dm')
        $(@).removeClass('mpcdmc')
      else
        $(@).addClass('mpcdmc')
      return
    ###


    @$('.mpcf').click ->
      if self.switch('f')
        $(@).find('.mpcfu').show()
      else
        $(@).find('.mpcfu').hide()
      return

    if GG.env is 'dev'
      @$('.mpcz').hide()
      @$('.mpcs').hide()
    else
      statusUpdate = (stype, st, fn) ->
        if not GG.user
          fn no if fn?
          return
        staction = if st then 'add' else 'remove'
        moTool.postAjax
          url: "/gekijou/" + stype + "/" + staction,
          value: { _id: GG.gekijou._id },
          showLoad: no,
          callBack: (data) ->
            success = data and data.code is 0
            fn success if fn?
            return
          ,
          showLoad: false,
          success: false,
          error: false,
          json: false
        return

      @$('.mpcz').click ->
        # 赞
        $this = $ this
        st = $this.hasClass 'btnzg'
        statusUpdate 'good', !st, (success) ->
          if success
            if st
              $this.removeClass 'btnzg'
            else
              $this.addClass 'btnzg'
          return
        return
      @$('.mpcs').click ->
        # 收藏
        $this = $ this
        st = $this.hasClass 'mpcsg'
        statusUpdate 'favorite', !st, (success) ->
          if success
            if st
              $this.removeClass 'mpcsg'
              moTool.showSuccess '已成功取消收藏！'
            else
              $this.addClass 'mpcsg'
              moTool.showSuccess '已成功添加收藏！'
          return
        return

    return

class Editorbar extends ControlBar

  constructor: (@el, @editor) ->
    super @el

    @gekijou = @editor.gekijou
    @em = @editor.gekijou.em
    @pb = @editor.gekijou.pb
    @imgtool = new ImageTools()
    @_extend = off

  setId: (_id) ->
    $modal = $ '#savemodal'
    $modal.find('#gekijou_id').val _id
    @showpreview()
    return

  getId: ->
    $modal = $ '#savemodal'
    $modal.find('#gekijou_id').val()

  showpreview: ->
    _id = $('#savemodal #gekijou_id').val()
    if _id
      $('#gekijoupreviewbtn').attr('href', "/gekijou/view/#{_id}").show()

  extend: (_ex = on) ->
    if not _ex is @_extend
      self = @
      @_extend = not @_extend
      $textarea = @$('#inputboxtextarea')
      if @_extend
        $textarea.val ''
        @el.addClass 'full-editor'
        setTimeout ->
            $textarea.replaceWith '<div id="inputboxtextarea" contentEditable="true"></div>'
            $textarea = self.$('#inputboxtextarea')
            $textarea.focus()
            return
          , 300
      else
        $textarea.html ''
        @el.removeClass 'full-editor'
        setTimeout ->
            $textarea.replaceWith '<textarea id="inputboxtextarea" class="pie" placeholder="文字,弹幕,音频,中二咒语" maxlength="200"></textarea>'
            # rebind textarea
            self.bindeditor()
            $textarea = self.$('#inputboxtextarea')
            $textarea.focus()
            return
          , 300
    return

  showcmdbox: (bshow) ->
    $inputboxcmdbox = @$ '#inputboxcmdbox'
    if $inputboxcmdbox.is(':visible') is bshow
      return
    if bshow
      $inputboxcmdbox.show()
      setTimeout ->
          $inputboxcmdbox.css 'max-height', 200
          return
        , 0
    else
      $inputboxcmdbox.css 'max-height', 0
      setTimeout ->
          $inputboxcmdbox.hide()
          return
        , 150
    return

  selectcmdbox: (down) ->
    $inputboxcmdbox = @$ '#inputboxcmdbox'
    $ps = $inputboxcmdbox.find 'p'
    iselect = -1

    for p, i in $ps
      $p = $(p)
      if $p.hasClass('select')
        iselect = i
        break

    if down
      if iselect < $ps.length - 1
        if iselect >= 0
          $($ps[iselect]).removeClass 'select'
        $($ps[iselect + 1]).addClass 'select'
    else
      if not $inputboxcmdbox.is(':visible')
        # not shown
        return
      if iselect >= 0
        $($ps[iselect]).removeClass 'select'
      if iselect - 1 >= 0
        $($ps[iselect - 1]).addClass 'select'
    return

  setcmd: (cmd) ->
    $inputboxtextarea = @$ '#inputboxtextarea'
    if cmd
      $inputboxtextarea.val cmd
      @showcmdbox no
      # @$('#inputboxcmdbox p.select').removeClass 'select'

      $inputboxtextarea.focus()
    return

  bindeditor: ->
    self = @

    $inputboxtextarea = @$ '#inputboxtextarea'
    $inputboxcmdbox = @$ '#inputboxcmdbox'
    # 按下按键
    $inputboxtextarea.keydown (e) ->
      if self._extend
        # 完整编辑器下不响应特殊按键
        return
      if e.which is 8
        # backspace
        if 2 <= @value.length <= 4
          self.showcmdbox on
        else if @value.length <= 1
          # hide cmd box
          self.showcmdbox no
      else if e.which is 40
        # down
        e.preventDefault()
        self.showcmdbox on
        self.selectcmdbox on
      else if e.which is 38
        e.preventDefault()
        self.selectcmdbox no
      else if e.which is 13
        e.preventDefault()
        if $inputboxcmdbox.is(':visible')
          $selp = $inputboxcmdbox.find 'p.select'
          if $selp and $selp.length > 0
            cmd = $selp.data 'cmd'
            self.setcmd cmd
        else
          self.$('#inputboxtextareapostbtn').click()
      else if e.which is 191 or e.which is 47
        # forward slash or '/'
        self.showcmdbox on
      else
        if @value.length >= index.mo.maxLength
          e.preventDefault()
      return

    return

  bind: ->
    self = @

    # 扩展编辑器
    $exinput = @$('#extend-input')
    $exinput.click ->
      self.extend not self._extend
      return

    # 新事件
    $newevbtn = @pb.$('#mpiloop')
    $newevbtn.addClass 'mpiloopa newevent'
    $newevbtn.text ''
    $newevbtn.click ->
      modal = $ '#neweventmodal'
      newid = self.em.lastid() + 1
      modal.find('#newevent_name').val "新事件 #{newid}"
      moTool.showModalBox modal
      return

    $('#neweventokbtn').click ->
      modal = $ '#neweventmodal'
      name = modal.find('#newevent_name').val()
      time = parseInt modal.find('#newevent_time').val()

      if name and time >= 0
        self.em.insert name, time
        self.gekijou.rearrange on
        self.gekijou.played self.em.currentIndex()

        moTool.hideModalBox modal
      return

    # 修改事件
    $('#editeventokbtn').click ->
      modal = $ '#editeventmodal'

      i = modal.data 'event-index'
      name = modal.find('#editevent_name').val()
      time = parseInt modal.find('#editevent_time').val()

      if name and time >= 0
        ev = self.em.get i
      if ev
        ev.name = name
        ev.time = time
        self.gekijou.rearrange on

        moTool.hideModalBox modal
      return

    # 删除事件
    $('#editeventdelbtn').click ->
      modal = $ '#editeventmodal'

      i = modal.data 'event-index'

      if i >= 0
        ev = self.em.del i
        self.gekijou.reset()
        self.gekijou.rearrange()

      moTool.hideModalBox modal
      return

    # 设置
    $settingsbtn = @pb.$('#mpisettings')
    $settingsbtn.click ->
      modal = $ '#settingsmodal'
      modal.find('#cb_show_name').prop 'checked', GG.opts['showname']
      modal.find('#cb_instant_show').prop 'checked', GG.opts['instantshow']
      moTool.showModalBox modal
      return

    # 保存设置
    $('#settingsokbtn').click ->
      modal = $ '#settingsmodal'
      opts =
        showname: modal.find('#cb_show_name').prop('checked'),
        instantshow: modal.find('#cb_instant_show').prop('checked')
      GG.gekijou.setOptions opts
      moTool.hideModalBox modal
      return

    # 保存
    $gsavebtn = @pb.$('#mpisave')
    $gsavebtn.click ->
      moTool.showModalBox $ '#savemodal'
      return

    $('#gekijouokbtn').click ->
      $modal = $ '#savemodal'
      title = $modal.find('#gekijou_title').val()
      intro = $modal.find('#gekijou_intro').val()

      if title
        moTool.hideModalBox $modal
        self.editor.save title, intro

      return

    $gsavebtn.show()

    $inputboxtextarea = @$ '#inputboxtextarea'
    $inputboxcmdbox = @$ '#inputboxcmdbox'

    @bindeditor()

    $inputboxcmdbox.find('p').click ->
      cmd = $(this).data 'cmd'
      self.cmdbox cmd
      return

    @$('#inputboxtextareapostbtn').click ->
      curev = self.em.current()
      if curev
        $textbox = self.$('#inputboxtextarea')
        if self._extend
          text = $textbox.html()
          if text
            curev.parseAction text, on
            $textbox.html ''
        else
          text = $textbox.val()
          if text
            curev.parseAction text
            $textbox.val ''
            self.showcmdbox no
      else
        moTool.showError '请先新建一个事件！'
      return

    # 图片上传
    @imgtool.initImageUpload (err, type, url) ->
      if err or typeof url isnt 'string'
        moTool.showError '图片上传失败'
        return

      curev = self.em.current()
      if curev
        switch type
          when 'chat'
            if self._extend
              $textarea = self.$ '#inputboxtextarea'
              # TODO: check url and replace selection range
              # class="chat-emotion"
              $textarea.append '<img src=' + JSON.stringify(url) + ' />'
            else
              curev.showImage url
          #when 'nochara'
            # 状态图片
          when 'background'
            curev.switchBackground url
      else
        moTool.showError '请先新建一个事件！'

      return

    return
