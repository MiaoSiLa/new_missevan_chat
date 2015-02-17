var GEvent, GEventManager;

GEvent = (function() {
  function GEvent(id, name, time) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.actions = [];
  }

  GEvent.prototype.action = function(type, val1, val2, norun) {
    var an;
    an = {
      type: type
    };
    switch (type) {
      case 'text':
        an.line = index.mo.chatLine;
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          this.runAction(an);
        }
        break;
      case 'image':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          this.runAction(an, function() {
            return an.line = index.mo.chatLine - 1;
          });
        }
        break;
      default:
        return;
    }
    this.actions.push(an);
  };

  GEvent.prototype.runAction = function(action, cb) {
    if (GG.gekijou.isplaying()) {
      GG.chara.select(action.chara);
    }
    switch (action.type) {
      case 'text':
        chatBox.loadBubble({
          msg: action.val,
          type: 1,
          sender: index.mo.sender
        });
        if (cb != null) {
          cb();
        }
        break;
      case 'image':
        chatBox.loadBubble({
          msg: action.val,
          type: 7,
          sender: index.mo.sender
        }, function() {
          if (cb != null) {
            return cb();
          }
        });
    }
  };

  GEvent.prototype.run = function(i) {
    var self;
    if (i == null) {
      i = 0;
    }
    if (i < this.actions.length) {
      self = this;
      this.runAction(this.actions[i], function() {
        self.run(i + 1);
      });
    }
  };

  GEvent.prototype.parseCharaId = function(charaid) {
    var cids;
    if (typeof charaid === 'number') {
      return charaid;
    } else if (typeof charaid === 'string') {
      cids = charaid.split(':');
      if (cids.length === 2 && cids[0] === 'chara') {
        return parseInt(cids[1]);
      }
    }
    return -1;
  };

  GEvent.prototype.parseAction = function(text) {
    if (text[0] !== '/') {
      return this.action('text', GG.chara.current(), text);
    } else {

    }
  };

  GEvent.prototype.parse = function(block) {
    var line, lineprops, lines, _i, _len;
    lines = GG.util.splitline(block);
    if (lines.length > 0) {
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        lineprops = GG.util.splitprop(line);
        try {
          this.action(lineprops[0], lineprops[1], JSON.parse(lineprops[2]), true);
        } catch (_error) {}
      }
    }
  };

  GEvent.prototype.realtime = function() {
    return this.time;
  };

  return GEvent;

})();

GEventManager = (function() {
  function GEventManager() {
    this.events = [];
    this._lastid = 0;
    this._event = null;
    this._timecount = 0;
    this._currentIndex = -1;
  }

  GEventManager.prototype.lastid = function() {
    return this._lastid;
  };

  GEventManager.prototype.current = function() {
    return this._event;
  };

  GEventManager.prototype.next = function() {
    if (this._currentIndex < this.events.length - 1) {
      this._currentIndex++;
      this._event = this.events[this._currentIndex];
      return true;
    } else {
      return false;
    }
  };

  GEventManager.prototype.totaltime = function() {
    return this._timecount;
  };

  GEventManager.prototype.moveToBegin = function() {
    this._currentIndex = 0;
    this._event = this.events[0];
  };

  GEventManager.prototype.runAtTime = function(time) {
    var ev, i, tt, _i, _len, _ref;
    tt = 0;
    _ref = this.events;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      ev = _ref[i];
      if (time >= tt) {
        if (this._currentIndex < i) {
          if (this.next()) {
            this.run();
          }
        }
        if (time >= this._timecount) {
          GG.gekijou.emit('end');
        }
      } else {
        break;
      }
      tt += ev.realtime();
    }
    return this._currentIndex;
  };

  GEventManager.prototype.run = function() {
    if (this._event) {
      this._event.run();
    }
  };

  GEventManager.prototype.add = function(name, time, id) {
    var ev;
    if (time == null) {
      time = 2000;
    }
    if (id == null) {
      id = -1;
    }
    if (id === -1) {
      id = this._lastid++;
    }
    ev = new GEvent(id, name, time);
    this.events.push(ev);
    this._event = ev;
    this._timecount += ev.realtime();
    return ev;
  };

  GEventManager.prototype.parse = function(block_script) {
    var b, blocks, ev, id, name, props, time, _i, _len;
    this._timecount = 0;
    blocks = GG.util.splitblock(block_script);
    for (_i = 0, _len = blocks.length; _i < _len; _i++) {
      b = blocks[_i];
      props = GG.util.splitprop(b.title);
      if (props.length >= 4 && props[0] === 'define') {
        id = parseInt(props[1]);
        name = JSON.parse(props[2]);
        time = parseInt(props[3]);
        ev = this.add(name, time, id);
        ev.parse(b.content);
      }
    }
  };

  return GEventManager;

})();
