console.log 'gekijou embed'

class DScrollbar

  constructor: ->

  init: ->
    sw = $ '.scroll-wrapper'
    if not (sw and sw.length)
      return

    sw.find('.scroll-content').scroll ->
      $this = $ @
      $sb = $this.parent().find '.scroll-bar'

      h = $this.height()
      h_sb = $sb.height()
      h_content = $this.find('div').height()

      ratio = @.scrollTop / (h_content - h)
      top = (h - h_sb) * ratio

      $sb.css 'top', top
      return

    return

class ContactList
  constructor: ->

  init: ->
    cl = $ '.contact_list'
    if not (cl and cl.length)
      return
    self = @
    cl.find('.contact_item').click ->
      actorid = $(@).data 'actorid'
      url = '/theatre/api/actor?id=' + actorid
      $.ajax
        url: url,
        dataType: 'json',
        success: (data) ->
          if data and data.state is 'success'
            self.load data.info
          return
      return
    # end of init
    return

  load: (actor) ->
    box_bd = $ '.box .box_bd'
    empty = box_bd.find '.empty'
    profile = box_bd.find '.profile'
    if not actor
      profile.hide()
      empty.show()
    else
      profile.find('img').attr 'src', actor.front_cover
      profile.find('.nickname').text actor.name
      profile.find('.signature').text actor.signature

      aa = profile.find '.action_area'
      if parseInt actor.homepage
        aa.find('.button').attr 'href', '/theatre/actor/space?actorid=' + actor.id
        aa.show()
      else
        aa.hide()

      empty.hide()
      profile.show()

    # end of load
    return

class GekijouEmbed
  constructor: ->

  load: (chatid) ->
    share_box = $ '#share_box'
    chat_box = $ '#chat_box'
    if chatid
      chat_box.find('.box_bd').html '<iframe class="gekijou-embed" src="/gekijou/view/' + chatid + '"></iframe>'
      share_box.hide()
      chat_box.show()
      chat_box.find('iframe').focus()
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
