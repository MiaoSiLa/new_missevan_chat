
# base session

class Util

  init: ->

class GGManager

  constructor: ->


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

    for pn in pns
      pos = 100 - pn.pos * 100
      name = moTool.boardReplaceTxt pn.name
      html += """
              <div id=\"event#{pn.id}\" class="mpf" style="top: #{pos}%;">
                <div class="mpfl"></div>
              """
      # 非开发模式下不显示事件名
      if GG.env is 'dev'
        html += "<div class=\"mpfi\"><span>#{name}</span></div>"

      html += "</div>"

    @$('.mpfo').html html
    @_data = pns
    return

  moveToLast: ->
    if @_data.length > 0
      [..., l] = @_data
      @pos l.pos


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

  setId: (_id) ->
    $modal = $ '#savemodal'
    $modal.find('#gekijou_id').val _id
    return

  getId: () ->
    $modal = $ '#savemodal'
    $modal.find('#gekijou_id').val()

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
