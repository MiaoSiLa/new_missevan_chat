###
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
###

class Chara

  constructor: (@el) ->
    @charas = []
    @_lastid = 0
    @_showmodal = no
    @_sel = -1
    @pagination = new Paginationbar @el.find('.pagelist')

  add: (c, id = -1) ->
    if id is -1
      id = @_lastid++
    @charas.push
      id: id,
      username: c.username,
      subtitle: c.subtitle,
      iconid: c.iconid,
      iconurl: c.iconurl,
      iconcolor: c.iconcolor
    id

  currentId: ->
    if @_sel >= 0
      return @charas[@_sel].id
    -1

  selectId: (id) ->
    for c, i in @charas
      if c.id is id
        @select i
        break
    return

  select: (i) ->
    if i isnt @_sel
      if @_sel >= 0
        @el.find(".charabox:eq(#{@_sel})").removeClass 'selected'

      if i >= @charas.length
        i = -1

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
                  <img alt="#{subtitle}" src="#{sender.icon}">
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
    url = '/person/iconlist?pagesize=12'

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
            iconcolor: c.iconcolor

          if p then page = p
          pagecount = data.pagecount

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
      subtitle = moTool.boardReplaceTxt c.subtitle
      html += """
              <div data-user='#{strc}' class="charaicon">
                <div class="chaticonbox">
                  <img alt="#{subtitle}" src="#{sender.icon}">
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

    return

  devbind: ->
    self = @

    @el.find('#selecticon').show()

    @el.find('.s_m_t_r_b').click ->
      if not $(this).hasClass 's_m_t_r_b_a'
        self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass 's_m_t_r_b_a'
        $(this).addClass 's_m_t_r_b_a'

      self.el.find('#soundsearchinput').val ''
      self.pagination.page 1
      self.searchIcon()
      return

    @el.find('#searchbtn').click ->
      self.pagination.page 1
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

    if GG.env is 'dev'
      @devbind()
      if @charas.length > 0
        @refresh()
      else
        suser = $('#user').html()
        if suser
          try
            @select @add JSON.parse suser
            @refresh()

      @searchIcon()
    else
      # load from script
      @refresh()

    cb()
    return

  parse: (block_script) ->
    blocks = GG.util.splitblock block_script

    for b in blocks
      props = GG.util.splitprop b.title
      lines = GG.util.splitline b.content

      if props.length >= 3 and props[0] is 'define' and lines.length > 0
        try
          cid = parseInt(props[1])
          c =
            id: cid,
            username: JSON.parse(props[2]),
            subtitle: if props[3] then JSON.parse(props[3]) else ''

          for line, i in lines
            lineprops = GG.util.splitprop line
            if lineprops.length >= 4 && lineprops[0] is 'icon'
              c.iconid = parseInt lineprops[1]
              c.iconurl = JSON.parse lineprops[2]
              c.iconcolor = JSON.parse lineprops[3]

          @add c, cid

    return
