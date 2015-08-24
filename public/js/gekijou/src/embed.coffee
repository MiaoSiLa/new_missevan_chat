console.log 'gekijou embed'

class DScrollbar

  constructor: ->

  update: ($sb) ->
    #$sb = $ @
    $sw = $sb.parents '.scroll-wrapper'
    $content = $sw.find '.scroll-content'
    if $content.length <= 0
      return

    h = $content.height()
    h_sb = $sb.height()
    h_content = $content.find('div').height()

    top = parseInt $sb.css('top').replace('px', '')
    ratio = top / (h - h_sb)
    scrollTop = (h_content - h) * ratio

    $content[0].scrollTop = scrollTop
    return

  init: ->
    sw = $ '.scroll-wrapper'
    if not (sw and sw.length)
      return

    sw.find('.scroll-content').scroll ->
      $content = $ @
      $sb = $content.parent().find '.scroll-bar'
      if $sb.hasClass 'draggable'
        return

      h = $content.height()
      h_sb = $sb.height()
      h_content = $content.find('div').height()

      ratio = @.scrollTop / (h_content - h)
      top = (h - h_sb) * ratio

      $sb.css 'top', top
      return

    sb = sw.find '.scroll-bar'
    if sb.draggable
      sb.draggable
        axis: 'y',
        cursor: 'default',
        containParent: true
      self = @
      sb.mousemove (e) ->
        if e.button is 0 and e.buttons is 1
          self.update $(@)
        return

    sb.parent().click (e) ->
      $this = $ @
      $sw = $this.parents '.scroll-wrapper'
      $content = $sw.find '.scroll-content'
      $sb = $this.find '.scroll-bar'
      if $content.length <= 0
        return

      h = $content.height()
      h_sb = $sb.height()
      h_content = $content.find('div').height()

      top = parseInt $sb.css('top').replace('px', '')
      offsetY = e.offsetY
      if offsetY < top
        scrollTop = $content[0].scrollTop - 50
      else if offsetY > top + h_sb
        scrollTop = $content[0].scrollTop + 50
      else
        return

      if scrollTop < 0
        scrollTop = 0
      else if scrollTop > h_content - h
        scrollTop = h_content - h

      $content[0].scrollTop = scrollTop

      return

    return

class ContactList
  constructor: ->

  init: ->
    cl = $ '.contact_list'
    if not (cl and cl.length)
      return
    @init_state()
    self = @
    cl.find('.contact_item').click ->
      actorid = $(@).data 'actorid'
      url = '/api/actor?id=' + actorid
      $.ajax
        url: url,
        dataType: 'json',
        success: (data) ->
          if data and data.state is 'success'
            self.load data
          return
      return
    # end of init
    return

  init_state: ->
    @pushState = window.history and window.history.pushState
    if @pushState
      self = @
      window.onpopstate = (e) ->
        if e.state and e.state.actor
          self.load e.state.actor, on
        else
          window.location.reload()
        return

    return

  update_url: (actor_id, actor) ->
    if @pushState
      if actor_id
        window.history.pushState {actor: actor}, '', "/theatre/actor/profile?actorid=#{actor_id}"
      else
        window.history.pushState {actor: actor}, '', '/theatre/actor'
    return

  load: (actor, popstate) ->
    box_bd = $ '.box .box_bd'
    empty = box_bd.find '.empty'
    profile = box_bd.find '.profile'
    actor_id = null
    if not actor or not actor.info
      profile.hide()
      empty.show()
    else
      info = actor.info
      actor_id = info.id
      profile.find('.nickname').text info.name
      profile.find('.signature').text info.signature
      profile.find('#profile-intro .detail').text (if info.intro then info.intro else '还没有填写')

      # 头像
      profile.find('.avatar img').attr 'src', info.avatar_url
      $more_avatars = profile.find '.profile_more_avatars'
      if actor.avatars and actor.avatars.length
        html = '\n'
        for a in actor.avatars
          html += '<img class="img lazy" src="' + a.avatar_url + '" />\n'
        html += '<img class="img lazy img-first" src="' + info.avatar_url + '" style="display:none" />'
        $more_avatars.html html
        $more_avatars.show()
        $more_avatars.find('img').click ->
          $this = $ @
          $this.parent().find('.img-first').show()
          $profile = $this.parents '.profile'
          $profile.find('.avatar img').attr 'src', $this.attr('src')
          return
      else
        $more_avatars.html ''
        $more_avatars.hide()

      gekijou_count = if actor.scripts then actor.scripts.length else 0
      shares_count = if actor.shares then actor.shares.length else 0

      # 小剧场经历
      $anal = profile.find '.profile_analytics span strong'
      $($anal[0]).text gekijou_count.toString()
      $($anal[1]).text shares_count.toString()

      # 描述
      profile.find('#profile-gekijou a').attr 'href', '/theatre/actor/scripts?actorid=' + info.id
      profile.find('#profile-shares a').attr 'href', '/theatre/actor/space?actorid=' + info.id

      profile.find('#profile-shares .detail').text (if shares_count > 0 then "共 #{shares_count} 条" else '还没有朋友圈')
      if gekijou_count
        html = '\n'
        for script in actor.scripts
          html += '<img class="profile_script_img" src="' + script.cover_url + '" />\n'
        profile.find('#profile-gekijou .detail').html html
      else
        profile.find('#profile-gekijou .detail').text '还没有演过剧本'

      empty.hide()
      profile.show()

    @update_url(actor_id, actor) if not popstate

    # end of load
    return

class GekijouEmbed
  constructor: ->

  load: (chatid) ->
    share_box = $ '#share_box'
    chat_box = $ '#chat_box'
    if share_box.hasClass 'box_active'
      return
    if chatid
      share_box.addClass 'box_active'
      chat_box.find('.box_bd').html '<iframe class="gekijou-embed" src="/gekijou/view/' + chatid + '"></iframe>'
      ifr = chat_box.find 'iframe'
      ifr.load ->
        # $cm = ifr.contents().find '#chatmain'
        share_box.hide().removeClass 'box_active'
        chat_box.show()
        ifr.focus()
        return
    else
      chat_box.find('.box_bd').html ''
      chat_box.hide()
      share_box.show()
    return

  back: ->
    @load off

  insertcss: ->
    content = """
              .gekijou-embed {
                width: 100%;
                height: 100%;
                border: none;
              }
              #chat_box .box_bd {
                overflow: hidden;
              }
              """
    s = document.createElement 'style'
    s.type = 'text/css'
    if typeof s.textContent is 'string'
      s.textContent = content
    else
      s.styleSheet.cssText = content;
    $('head').append s
    return

  init: ->
    share_box = $ '#share_box'
    if not (share_box and share_box.length)
      return

    self = @
    @insertcss()

    backbtn = $ '#chat_box .back'
    backbtn.click ->
      self.back()
      return

    cc = $ '.content_chat'
    cc.click ->
      chatid = $(@).data 'chatid'
      self.load chatid
      off


    return

$(document).ready ->
  ge = new GekijouEmbed()
  ds = new DScrollbar()
  cl = new ContactList()
  ge.init()
  ds.init()
  cl.init()
  return
