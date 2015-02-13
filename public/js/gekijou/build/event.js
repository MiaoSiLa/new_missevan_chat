var Event, EventManager;

Event = (function() {
  function Event(id, name, time) {
    this.id = id;
    this.name = name;
    this.time = time;
  }

  Event.prototype.parse = function(block) {};

  return Event;

})();

EventManager = (function() {
  function EventManager() {
    this.events = [];
    this._lastid = 0;
  }

  EventManager.prototype.lastid = function() {
    return this._lastid;
  };

  EventManager.prototype.add = function(name, time) {
    var ev, id;
    if (time == null) {
      time = 2000;
    }
    id = this._lastid++;
    ev = new Event(id, name, time);
    this.events.push(ev);
    return ev;
  };

  return EventManager;

})();
