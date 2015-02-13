class Event

  constructor: (@id, @name, @time) ->
    #alert @name

  # parse
  parse: (block) ->

class EventManager

  constructor: () ->
    @events = []
    @_lastid = 0

  lastid: () ->
    @_lastid

  add: (name, time = 2000) ->
    id = @_lastid++
    ev = new Event id, name, time
    @events.push ev
    ev
