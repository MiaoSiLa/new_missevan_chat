###
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
###

class Chara

  constructor: (@el) ->
    @charas = []
    @_lastid = 0
    @_showmodal = no
    @_sel = -1

  add: (c) ->
    id = @_lastid++
    @charas.push
      id: id,
      username: c.username,
      subtitle: c.subtitle,
      iconurl: c.iconurl,
      iconcolor: c.iconcolor
    id

  select: (i) ->
    if i isnt @_sel
      if @_sel > 0
        @el.find(".charabox:eq(#{@_sel})").removeClass 'selected'

      if i > 0
        @el.find(".charabox:eq(#{i})").addClass 'selected'
        index.mo.sender = chatBox.sender @charas[i]
      else
        index.mo.sender = null

      @_sel = i

    return

  refresh: ->
    html = ''

    $modal = @el.find '#charamodal'
    $modal.html ''

    if @charas.length <= 0
      return

    for c, i in @charas
      sender = chatBox.sender c
      name = moTool.boardReplaceTxt c.username
      subtitle = moTool.boardReplaceTxt c.subtitle
      html += "<div id=\"chara#{c.id}\" class=\"charabox"
      html += ' selected' if i is @_sel
      html += """
              \">
                <div class="chaticonbox">
                  <img src="#{sender.icon}">
                </div>
                <div class="clear"></div>
                <div class="chatusername" style="color:#ffffff;">
                  <span>#{name}</span>
                </div>
                <div class="chatsubtitle">
                  <span style="color:#91c0ed;">#{subtitle}</span>
                </div>
                <div class="delbtn"></div>
              </div>
              """

    $modal.html html

    self = @
    $modal.find('.charabox').click ->
      sid = $(this).attr 'id'
      id = parseInt sid.replace('chara', '')
      self.select id
      return

    return

  bind: ->
    self = @
    $mpc = @el.find '.mpc'

    @el.find('.sidetext').click ->
      if self._showmodal
        $mpc.removeClass 'showmodal'
      else
        $mpc.addClass 'showmodal'
      self._showmodal = not self._showmodal
      return

    return

  # chara init
  init: (cb) ->
    @bind()

    suser = $('#user').html()
    if suser
      try
        @select @add JSON.parse suser
        @refresh()

    cb()
    return
