###
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
###

class Chara

  constructor: (@el) ->
    @iconUrlPrefix = 'http://cdn.xiaojuchang.tv/avatars/'
    @charas = []
    @_lastid = 0
    @_showmodal = no
    @_sel = -1
    @pagination = new Paginationbar @el.find('.pagelist')

  add: (c, id = -1) ->
    if id is -1
      id = @_lastid++
    else
      @_lastid = Math.max @_lastid, id + 1

    @charas.push
      id: id,
      username: c.username,
      showon: c.showon,
      iconid: c.iconid,
      iconurl: c.iconurl
    #subtitle: c.subtitle,
    #iconcolor: c.iconcolor
    id

  sender: (user) ->
    if user
      s =
        id: user.id,
        name: user.username,
        icon: @iconUrlPrefix + user.iconurl
    else
      s = null
    s

  currentId: ->
    if @_sel >= 0
      return @charas[@_sel].id
    -1

  currentShowOn: ->
    if @_sel >= 0
      return @charas[@_sel].showon
    null

  selectId: (id) ->
    found = off
    for c, i in @charas
      if c.id is id
        found = on
        @select i
        break
    if not found
      @select -1
    found

  removeId: (id) ->
    for c, i in @charas
      if c.id is id
        @remove i
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
        index.mo.sender = @sender @charas[i]
      else
        index.mo.sender = null

      @_sel = i

    return

  remove: (i) ->
    if i is @_sel
      @select -1
    @charas.splice i, 1
    @refresh()
    return

  refresh: ->
    html = ''

    $modal = @el.find '#charamodal #charauserlist'
    $modal.html ''

    if @charas.length <= 0
      return

    for c, i in @charas
      sender = @sender c
      name = GG.util.escape c.username
      #subtitle = GG.util.escape c.subtitle
      html += "<div id=\"chara#{c.id}\" class=\"charabox"
      html += ' selected' if i is @_sel
      html += '\">\n'
      if GG.env is 'dev'
        html += '<div class="delbtn">x</div>\n'
      html += """
                <div class="chaticonbox">
                  <img alt="#{name}" title="#{name}" src="#{sender.icon}">
                </div>
                <div class="clear"></div>
                <div class="chatusername" style="color:#ffffff;">
                  <span>#{name}</span>
                </div>
              </div>
              """
      ###
      <div class="chatsubtitle">
        <span style="color:#91c0ed;">#{subtitle}</span>
      </div>
      ###

    $modal.html html

    self = @
    $modal.find('.charabox').click ->
      sid = $(this).attr 'id'
      id = parseInt sid.replace('chara', '')
      self.selectId id
      return

    $modal.find('.delbtn').click ->
      sid = $(this).parent().attr 'id'
      id = parseInt sid.replace('chara', '')
      self.removeId id
      off

    return

  initIconCatalog: () ->
    self = @
    url = '/api/cataloglist/actor'

    moTool.getAjax
      url: url,
      callBack: (data) ->
        if data.state is 'success' and data.info
          self.updateCatalog data.info
        return

    return

  searchIcon: () ->
    self = @
    url = '/api/iconlist?pagesize=12'

    # query
    query = @el.find('#soundsearchinput').val()
    url += '&name=' + encodeURIComponent(query) if query

    # catalog
    bs = @el.find '.s_m_t_r_b'
    type = 0
    for b, i in bs
      if $(b).hasClass 's_m_t_r_b_a'
        type = $(b).data 'catalog'
        break
    if type > 0
      url += "&catalog=#{type}"

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
            username: c.name,
            iconid: parseInt(c.id),
            iconurl: c.avatar
          #id: parseInt(c.user_id),
          #iconcolor: c.iconcolor
          #subtitle: c.title,

          if p then page = p
          pagecount = data.pagecount

        self.updatePagination page, pagecount
        self.showIcons iconusers
        return

    return

  updateCatalog: (icon_catalogs) ->
    # default
    self = @

    html = '<div class="s_m_t_r_b btn-default s_m_t_r_b_a">全部头像</div>\n';
    for ic in icon_catalogs
      html += '<div class="s_m_t_r_b btn-default" data-catalog="' + ic.id + '">' + ic.catalog_name + '</div>\n'
    @el.find('.s_m_t_r').html html

    # bind event
    @el.find('.s_m_t_r_b').click ->
      if not $(this).hasClass 's_m_t_r_b_a'
        self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass 's_m_t_r_b_a'
        $(this).addClass 's_m_t_r_b_a'

      self.el.find('#soundsearchinput').val ''
      self.pagination.page 1
      self.searchIcon()
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
      sender = @sender c
      strc = JSON.stringify(c)
      name = GG.util.escape c.username
      html += """
              <div data-user='#{strc}' class="charaicon">
                <div class="chaticonbox">
                  <img alt="#{name}" title="#{name}" src="#{sender.icon}">
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

  appendCandidateIcons: (avatars, mainIconUrl) ->
    $modal = $ '#newcharamodal'
    $ci = $modal.find '.candidate-icons'
    if not avatars or avatars.length <= 0
      $ci.html ''
      return

    html = '<img data-iconurl="' + mainIconUrl + '" src="' + @iconUrlPrefix + mainIconUrl + '" />\n'
    for ava in avatars
      html += '<img data-iconurl="' + ava.avatar + '" src="' + @iconUrlPrefix + ava.avatar + '" />\n'
    $ci.html html

    self = @
    # bind click
    $ci.find('img').click ->
      $this = $ @
      $il = $this.parents '#newchara_iconlist'
      $mi = $il.find '.main-icon'
      iconurl = $this.data 'iconurl'
      $mi.data 'iconurl', iconurl
      $mi.attr 'src', self.iconUrlPrefix + iconurl
      return
    return

  showCreateModal: (user) ->
    $modal = $ '#newcharamodal'
    $modal.find('#newchara_user').data 'user', user
    $modal.find('#newchara_username').val user.username

    self = @
    mainIconUrl = user.iconurl
    url = '/api/actor?id=' + user.iconid
    $.ajax
      url: url,
      dataType: 'json',
      success: (data) ->
        if data and data.state is 'success'
          self.appendCandidateIcons data.avatars, mainIconUrl
        return

    $il = $modal.find '#newchara_iconlist'
    html = '<img data-iconurl="' + mainIconUrl + '" class="main-icon" src="' + @iconUrlPrefix + mainIconUrl + '" />'
    html += '<div class="candidate-icons">加载中…</div>'
    $il.html html

    #$modal.find('#newchara_subtitle').val ''
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

    $chbtns = @el.find '#charabtnlist'
    $chbtns.show()
    $chbtns.find('#nocharabtn').click ->
      # no chara button click
      self.select -1
      return

    @el.find('#searchbtn').click ->
      self.pagination.page 1
      self.searchIcon()
      return

    @el.find('#soundsearchinput').keydown (e) ->
      if e.which is 13
        # enter
        self.pagination.page 1
        self.searchIcon()
      return

    $('#newcharaokbtn').click ->
      $modal = $ '#newcharamodal'
      name = $modal.find('#newchara_username').val()
      if name
        user = $modal.find('#newchara_user').data 'user'
        iconurl = $modal.find('#newchara_iconlist .main-icon').data 'iconurl'
        showon = $modal.find('input[name=rd_chara_showon]:checked').val()
        user.username = name
        user.iconurl = iconurl
        user.showon = if showon is 'right' then 'right' else 'left'
        #user.subtitle = $modal.find('#newchara_subtitle').val()

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
      else if GG.user
        user = $.extend GG.user
        user.iconurl = user.avatar;
        @selectId @add user
        @refresh()

      @initIconCatalog()
      @searchIcon()
    else
      @el.addClass 'non-editor'
      # load from script
      @refresh()

    cb()
    return

  parse: (block_script) ->
    blocks = GG.util.splitblock block_script

    for b in blocks
      props = GG.util.splitprop b.title
      lines = GG.util.splitline b.content

      if props.length >= 2 and props[0] is 'define' and lines.length > 0
        try
          cid = parseInt(props[1])
          c =
            id: cid,
            username: JSON.parse(props[2]),
            subtitle: ''

          for line, i in lines
            lineprops = GG.util.splitprop line
            switch lineprops[0]
              when 'actor'
                if lineprops.length >= 2
                  c.iconid = parseInt lineprops[1]
              when 'icon'
                if lineprops.length >= 2
                  iconi = 1
                  reg_num = /^[0-9]+$/
                  if reg_num.test(lineprops[1])
                    c.iconid = parseInt lineprops[1]
                    iconi++
                  c.iconurl = JSON.parse lineprops[iconi]
                  if lineprops[iconi + 1] then c.iconcolor = JSON.parse lineprops[iconi + 1]
              when 'showon'
                if lineprops.length >= 2
                  c.showon = if lineprops[1] is 'right' then 'right' else 'left'
              when 'subtitle'
                if lineprops.length >= 2 and lineprops[1]
                  c.subtitle = JSON.parse lineprops[1]

          @add c, cid

    return
