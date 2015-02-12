
class ControlBar
  constructor: (@el) ->

  $: (selector) ->
    @el.find selector

  bind: ->


class Playbar extends ControlBar

  constructor: (@el) ->
    super @el

  bind: ->


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
