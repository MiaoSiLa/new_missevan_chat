
# base session

class Util

  init: ->



# Control bar session

class ControlBar
  constructor: (@el) ->

  $: (selector) ->
    @el.find selector

  bind: ->


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
                <div class="mpfi"><span>#{name}</span></div>
              </div>
              """

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

  bind: ->
    self = @

    @$('#inputboxneweventbtn').click ->
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
