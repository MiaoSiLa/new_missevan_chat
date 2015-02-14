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
    @pagination = new Paginationbar @el.find('.pagelist')

  add: (c) ->
    id = @_lastid++
    @charas.push
      id: id,
      username: c.username,
      subtitle: c.subtitle,
      iconurl: c.iconurl,
      iconcolor: c.iconcolor
    id

  current: ->
    if @_sel >= 0
      return @charas[@_sel].id
    -1

  select: (i) ->
    if i isnt @_sel
      if @_sel >= 0
        @el.find(".charabox:eq(#{@_sel})").removeClass 'selected'

      if i >= 0
        @el.find(".charabox:eq(#{i})").addClass 'selected'
        index.mo.sender = chatBox.sender @charas[i]
      else
        index.mo.sender = null

      @_sel = i

    return

  refresh: ->
    html = ''

    $modal = @el.find '#charamodal #charauserlist'
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

  searchIcon: () ->
    self = @
    url = '/person/iconlist?pagesize=6'

    # title
    title = @el.find('#soundsearchinput').val()
    url += '&title=' + encodeURIComponent(title) if title

    # profiletype
    bs = @el.find '.s_m_t_r_b'
    type = 0
    for b, i in bs
      if $(b).hasClass 's_m_t_r_b_a'
        type = i
        break
    if type > 0
      type = 4 if type > 2
      url += "&profiletype=#{type}"

    # page
    p = @pagination.page()
    url += '&p=' + p if p

    moTool.getAjax
      url: url,
      callBack: (data) ->
        iconusers = []
        page = 1
        pagecount = 0
        if data.state is 'success' and data.info
          iconusers = for c in data.info
            id: parseInt(c.user_id),
            username: c.username,
            subtitle: c.title,
            iconid: parseInt(c.id),
            iconurl: c.save_name,
            iconcolor: ''

          if p then page = p
          pagecount = 6

        self.updatePagination page, pagecount
        self.showIcons iconusers
        return

    return

  updatePagination: (page, pagecount) ->
    @pagination.update page, pagecount

  showIcons: (iconusers) ->
    html = ''

    $modal = @el.find '#charamodal #selecticonlist'
    $modal.html ''

    if iconusers.length <= 0
      return

    for c in iconusers
      sender = chatBox.sender c
      strc = JSON.stringify(c)
      html += """
              <div data-user='#{strc}' class="charaicon">
                <div class="chaticonbox">
                  <img src="#{sender.icon}">
                </div>
                <div class="clear"></div>
              </div>
              """

    $modal.html html

    self = @
    $modal.find('.charaicon').click ->
      self.showCreateModal $(this).data 'user'
      return

    return

  showCreateModal: (user) ->
    $modal = $ '#newcharamodal'
    $modal.find('#newchara_user').data 'user', user
    $modal.find('#newchara_username').val user.username
    $modal.find('#newchara_subtitle').val ''
    moTool.showModalBox $modal
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

    # TODO: check env:dev
    @el.find('.s_m_t_r_b').click ->
      self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass 's_m_t_r_b_a'
      $(this).addClass 's_m_t_r_b_a'

    @el.find('#searchbtn').click ->
      self.searchIcon()
      return

    $('#newcharaokbtn').click ->
      $modal = $ '#newcharamodal'
      name = $modal.find('#newchara_username').val()
      if name
        user = $modal.find('#newchara_user').data 'user'
        user.username = name
        user.subtitle = $modal.find('#newchara_subtitle').val()

        self.add user
        self.refresh()

        moTool.hideModalBox $modal

      return

    @pagination.change ->
      self.searchIcon()
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

    @searchIcon()
    cb()
    return
