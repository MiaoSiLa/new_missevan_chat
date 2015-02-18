
# base session

class Util

  init: ->
    if not String::trim
      String::trim = ->
        return $.trim this

      return

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

class GGManager

  constructor: ->
    window.GG = @


# Image Tools

class ImageTools

  initImageUpload: (cb) ->
    dz = $ '#chattop'
    el = dz
    $('#imagefile input', el).fileupload
      url: 'http://backend1.missevan.cn/mimage/chatimage',
      dropZone: dz,
      dataType: 'json',
      multipart: true,
      done: (e, data) ->
        if data and data.result
          result = data.result
          if result.code is 0
            cb null, result.url
            return
        cb 'failed'
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

  bind: ->
    @$('.mpi').click ->
      GG.gekijou.emit 'play'
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
    @$('.mpfo').html ''

  data: (pns) ->
    html = ''

    for pn, i in pns
      pos = 100 - pn.pos * 100
      name = moTool.boardReplaceTxt pn.name
      html += """
              <div id=\"event#{pn.id}\" class="mpf" style="top: #{pos}%;">
                <div class="mpfl"></div>
              """
      # 非开发模式下不显示事件名
      if GG.env is 'dev'
        html += "<div data-event-index=\"#{i}\" class=\"mpfi\"><span>#{name}</span></div>"

      html += "</div>"

    @$('.mpfo').html html
    @_data = pns

    if GG.env is 'dev'
      # bind click event
      @$('.mpfi').click ->
        i = $(this).data 'event-index'
        if i >= 0
          GG.gekijou.reset()
          GG.gekijou.play i

    return

  moveToLast: ->
    if @_data.length > 0
      [..., l] = @_data
      @pos l.pos

  moveToBegin: ->
    @pos 0
    return

  start: ->
    @$('.mpi').removeClass('mpir').addClass('mpip')
    return

  pause: ->
    @$('.mpi').removeClass 'mpip'
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

  bind: ->
    self = @

    @$('.mpsv').click ->
      if self.switch('sv')
        $(@).find('.mpsvo').show()
      else
        $(@).find('.mpsvo').hide()
      return

    @$('.mpcdm').click ->
      if self.switch('dm')
        $(@).removeClass('mpcdmc')
      else
        $(@).addClass('mpcdmc')
      return

    @$('.mpcf').click ->
      if self.switch('f')
        $(@).find('.mpcfu').show()
      else
        $(@).find('.mpcfu').hide()
      return

    return

class Editorbar extends ControlBar

  constructor: (@el, @editor) ->
    super @el

    @gekijou = @editor.gekijou
    @em = @editor.gekijou.em
    @pb = @editor.gekijou.pb
    @imgtool = new ImageTools()

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

  bind: ->
    self = @

    # 新事件
    $newevbtn = @pb.$('#mpiloop')
    $newevbtn.addClass 'mpiloopa newevent'
    $newevbtn.text '+'
    $newevbtn.click ->
      modal = $ '#neweventmodal'
      newid = self.em.lastid() + 1
      modal.find('#newevent_name').val "新事件 #{newid}"
      moTool.showModalBox modal
      return

    $('#neweventokbtn').click ->
      modal = $ '#neweventmodal'
      name = modal.find('#newevent_name').val()
      time = modal.find('#newevent_time').val()

      if name
        self.em.add name, parseInt time
        self.gekijou.rearrange()

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

    # 按下POST
    @$('#inputboxtextarea').keypress (event) ->
      if event.which isnt 13
        if @value.length >= index.mo.maxLength
          event.preventDefault()
      else if event.which is 13
        event.preventDefault()
        self.$('#inputboxtextareapostbtn').click()
      return

    @$('#inputboxtextareapostbtn').click ->
      curev = self.em.current()
      if curev
        $textbox = self.$('#inputboxtextarea')
        text = $textbox.val()
        if text
          curev.parseAction text
          $textbox.val ''
      else
        moTool.showError '请先新建一个事件！'
      return

    # 图片上传
    @imgtool.initImageUpload (err, url) ->
      if err
        moTool.showError '图片上传失败'
        return

      curev = self.em.current()
      if curev
        curev.showImage url
      else
        moTool.showError '请先新建一个事件！'

      return

    return
