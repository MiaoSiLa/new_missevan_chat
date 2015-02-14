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
          chatBox.loadBubble({
            msg: val2,
            type: 1,
            sender: index.mo.sender
          });
        }
        break;
      case 'image':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          chatBox.loadBubble({
            msg: val2,
            type: 7,
            sender: index.mo.sender
          }, function() {
            return an.line = index.mo.chatLine - 1;
          });
        }
        break;
      default:
        return;
    }
    this.actions.push(an);
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

  GEventManager.prototype.moveToBegin = function() {
    this._event = this.events[0];
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
    return ev;
  };

  GEventManager.prototype.parse = function(block_script) {
    var b, blocks, ev, id, line, lineprops, lines, name, props, time, _i, _j, _len, _len1;
    blocks = GG.util.splitblock(block_script);
    for (_i = 0, _len = blocks.length; _i < _len; _i++) {
      b = blocks[_i];
      props = GG.util.splitprop(b.title);
      lines = GG.util.splitline(b.content);
      if (props.length >= 4 && props[0] === 'define') {
        id = parseInt(props[1]);
        name = JSON.parse(props[2]);
        time = parseInt(props[3]);
        ev = this.add(name, time, id);
        if (lines.length > 0) {
          for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
            line = lines[_j];
            lineprops = GG.util.splitprop(line);
            try {
              ev.action(lineprops[0], lineprops[1], JSON.parse(lineprops[2]), true);
            } catch (_error) {}
          }
        }
      }
    }
  };

  return GEventManager;

})();
