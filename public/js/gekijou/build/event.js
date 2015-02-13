var GEvent, GEventManager;

GEvent = (function() {
  function GEvent(id, name, time) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.actions = [];
  }

  GEvent.prototype.action = function(type, val) {
    switch (type) {
      case 'text':
        chatBox.loadBubble({
          msg: val,
          type: 1,
          sender: index.mo.sender
        });
        break;
      default:
        return;
    }
    this.actions.push({
      type: type,
      val: val
    });
  };

  GEvent.prototype.parseAction = function(text) {
    if (text[0] !== '/') {
      return this.action('text', text);
    } else {

    }
  };

  GEvent.prototype.parse = function(block) {};

  return GEvent;

})();

GEventManager = (function() {
  function GEventManager() {
    this.events = [];
    this._lastid = 0;
    this._event = null;
  }

  GEventManager.prototype.lastid = function() {
    return this._lastid;
  };

  GEventManager.prototype.current = function() {
    return this._event;
  };

  GEventManager.prototype.add = function(name, time) {
    var ev, id;
    if (time == null) {
      time = 2000;
    }
    id = this._lastid++;
    ev = new GEvent(id, name, time);
    this.events.push(ev);
    this._event = ev;
    return ev;
  };

  return GEventManager;

})();
