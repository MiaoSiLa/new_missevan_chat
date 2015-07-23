var GAction, GEvent, GEventManager;

GAction = (function() {
  function GAction(type) {
    this.type = type;
    if (this.type === 'text') {
      this.ready = true;
    } else {
      this.ready = false;
    }
  }

  GAction.prototype.load = function(cb) {
    var img, self;
    if (this.ready) {
      cb();
      return;
    }
    self = this;
    switch (this.type) {
      case 'image':
      case 'background':
        img = new Image();
        img.onload = function() {
          self.ready = true;
          cb();
        };
        img.src = this.val;
        self.img = img;
        break;
      case 'sound':
        moTool.getAjax({
          url: "/sound/getsound?soundid=" + this.val,
          showLoad: false,
          callBack: function(data2) {
            var s, sound, soundUrl;
            sound = data2.successVal.sound;
            soundUrl = sound.soundurl;
            s = soundManager.createSound({
              id: soundUrl,
              url: index.mo.soundPath + soundUrl,
              multiShot: false,
              onload: function() {
                self.ready = true;
                cb();
              }
            });
            s.load();
            self.Jsound = sound;
            self.sound = s;
          }
        });
        break;
      default:
        cb();
    }
  };

  GAction.prototype.attachlaststate = function() {
    var $cm;
    $cm = $('#chatbox .chatmessage:first');
    if ($cm && $cm.length === 1) {
      this.line = index.mo.chatLine;
      $cm.attr('id', 'chatline' + this.line);
      index.mo.chatLine++;
    }
  };

  GAction.prototype.attacheditor = function() {
    var $line;
    if (this.line >= 0) {
      $line = $('#chatline' + this.line);
      $line.prepend("<div class=\"line-editor\" data-line=\"" + this.line + "\" data-actionid=\"\">\n  <div class=\"line-del\">x</div>\n</div>");
      $line.find('.line-del').click(function(e) {
        var line;
        line = $(this).parent().data('line');
        if (GG.em.removeLine(parseInt(line))) {
          $line.remove();
        }
        e.stopPropagation();
      });
    }
  };

  GAction.prototype.run = function(cb) {
    var action;
    action = this;
    this.load(function() {
      var callback, msg, soundname, statetext;
      if (action.chara != null) {
        GG.chara.selectId(action.chara);
      }
      callback = function() {
        if (GG.env === 'dev') {
          action.attacheditor();
        }
        if (cb != null) {
          return cb();
        }
      };
      switch (action.type) {
        case 'text':
          action.line = index.mo.chatLine;
          GG.bubble.popup({
            msg: action.val,
            type: 1,
            sender: index.mo.sender
          });
          return callback();
        case 'state':
          action.line = index.mo.chatLine;
          statetext = action.val;
          if (action.chara !== -1) {
            statetext = '►► ' + index.mo.sender.name + ' ' + statetext;
          }
          GG.bubble.text(statetext);
          return callback();
        case 'image':
          return GG.bubble.popup({
            msg: action.val,
            type: 7,
            sender: index.mo.sender
          }, function() {
            action.line = index.mo.chatLine - 1;
            callback();
          });
        case 'background':
          return GG.bubble.background({
            url: action.val,
            effect: action.effect
          }, function() {
            if (GG.env === 'dev') {
              action.line = index.mo.chatLine;
              statetext = ': ' + "切换背景";
              GG.bubble.text(statetext);
            }
            callback();
          });
        case 'sound':
          msg = JSON.stringify(action.Jsound);
          chatBox.loadBubble({
            msg: msg,
            type: 6,
            sender: index.mo.sender
          });
          if (GG.env === 'dev') {
            soundname = action.Jsound ? action.Jsound.soundstr : '';
            action.line = index.mo.chatLine;
            statetext = ': ' + index.mo.sender.name + ' ' + ("播放了声音「" + soundname + "」");
            GG.bubble.text(statetext);
          }
          return callback();
      }
    });
  };

  return GAction;

})();

GEvent = (function() {
  function GEvent(id, name, time) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.actions = [];
  }

  GEvent.prototype.action = function(type, val1, val2, norun) {
    var an;
    an = new GAction(type);
    switch (type) {
      case 'text':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          an.run();
        }
        break;
      case 'image':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          an.run(function() {});
        }
        break;
      case 'background':
        an.effect = val1;
        an.val = val2;
        if (!norun) {
          an.run();
        }
        break;
      case 'sound':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          an.run(function() {});
        }
        break;
      case 'state':
        an.chara = this.parseCharaId(val1);
        an.val = val2;
        if (!norun) {
          an.run();
        }
        break;
      default:
        return;
    }
    this.actions.push(an);
  };

  GEvent.prototype.removeLine = function(line) {
    var ac, found, i, _i, _len, _ref;
    found = false;
    _ref = this.actions;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      ac = _ref[i];
      if (ac.line === line) {
        this.actions.splice(i, 1);
        found = true;
        break;
      }
    }
    return found;
  };

  GEvent.prototype.run = function(i) {
    var self;
    if (i == null) {
      i = 0;
    }
    if (i < this.actions.length) {
      self = this;
      this.actions[i].run(function() {
        self.run(i + 1);
      });
    }
  };

  GEvent.prototype.parseCharaId = function(charaid) {
    var cids;
    if (typeof charaid === 'number') {
      return charaid;
    } else if (typeof charaid === 'string') {
      if (charaid === 'nochara') {
        return -1;
      }
      cids = charaid.split(':');
      if (cids.length === 2 && cids[0] === 'chara') {
        return parseInt(cids[1]);
      }
    }
    return -1;
  };

  GEvent.prototype.parseAction = function(text) {
    var albumid, cmds, soundid, state;
    if (text[0] !== '/') {
      return this.action('text', GG.chara.currentId(), text);
    } else {
      cmds = GG.util.splitcommand(text);
      if (!cmds) {
        return;
      }
      switch (cmds[0]) {
        case 'sound':
          soundid = parseInt(cmds[1]);
          if (soundid) {
            return this.action('sound', GG.chara.currentId(), soundid);
          }
          break;
        case 'album':
          albumid = parseInt(cmds[1]);
          if (albumid) {
            return GG.album.loadAlbum(albumid, function() {
              GG.album.showSelect();
            });
          }
          break;
        case 'state':
          state = cmds[1];
          if (state) {
            return this.action('state', GG.chara.currentId(), state);
          }
      }
    }
  };

  GEvent.prototype.showImage = function(url) {
    return this.action('image', GG.chara.currentId(), url);
  };

  GEvent.prototype.switchBackground = function(url, effect) {
    return this.action('background', 'default', url);
  };

  GEvent.prototype.parse = function(block) {
    var line, lineprops, lines, _i, _len;
    lines = GG.util.splitline(block);
    if (lines.length > 0) {
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        lineprops = GG.util.splitprop(line);
        try {
          if (lineprops[0] === 'background') {
            lineprops[1] = JSON.parse(lineprops[1]);
          }
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
    this._curtime = 0;
    this._currentIndex = -1;
  }

  GEventManager.prototype.lastid = function() {
    return this._lastid;
  };

  GEventManager.prototype.current = function(i) {
    if (i == null) {
      i = -1;
    }
    if (i !== -1) {
      this._currentIndex = i;
      this._event = this.events[i];
    }
    return this._event;
  };

  GEventManager.prototype.currentIndex = function() {
    return this._currentIndex;
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

  GEventManager.prototype.totaltime = function(untili) {
    var counttime, ev, i, _i, _len, _ref;
    if (untili == null) {
      untili = -1;
    }
    if (untili !== -1) {
      counttime = 0;
      _ref = this.events;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        ev = _ref[i];
        if (untili <= i) {
          return counttime;
        }
        counttime += ev.realtime();
      }
    }
    return this._timecount;
  };

  GEventManager.prototype.calc = function() {
    var cur, e, pns, timecount, _i, _j, _len, _len1, _ref, _ref1;
    pns = [];
    cur = 0;
    timecount = 0;
    _ref = this.events;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      timecount += e.realtime();
    }
    this._timecount = timecount;
    _ref1 = this.events;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      e = _ref1[_j];
      pns.push({
        id: e.id,
        pos: cur / timecount,
        name: e.name
      });
      cur += e.realtime();
    }
    if (pns.length === 1) {
      pns[0].pos = 0.5;
    }
    return pns;
  };

  GEventManager.prototype.doAction = function(type, val) {
    if (this._event) {
      this._event.action(type, GG.chara.currentId(), val);
    }
  };

  GEventManager.prototype.moveToBegin = function() {
    this._currentIndex = 0;
    this._event = this.events[0];
  };

  GEventManager.prototype.getNeedPreload = function() {
    var ac, ev, i, j, len, pos, res, total, tt, _ctt, _i, _j, _len, _len1, _ref, _ref1;
    tt = 0;
    res = [];
    total = this.totaltime();
    _ref = this.events;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      ev = _ref[i];
      _ctt = ev.realtime();
      len = ev.actions.length;
      _ref1 = ev.actions;
      for (j = _j = 0, _len1 = _ref1.length; _j < _len1; j = ++_j) {
        ac = _ref1[j];
        pos = (tt + ((j + 1) * _ctt / len)) / total;
        switch (ac.type) {
          case 'image':
            res.push({
              pos: pos,
              type: 'image',
              imgurl: ac.val,
              action: ac
            });
            break;
          case 'background':
            res.push({
              pos: pos,
              type: 'image',
              imgurl: ac.val,
              action: ac
            });
            break;
          case 'sound':
            res.push({
              pos: pos,
              type: 'sound',
              soundid: ac.val,
              action: ac
            });
        }
      }
      tt += _ctt;
    }
    return res;
  };

  GEventManager.prototype.setVolume = function(volume) {
    var ac, _curev, _i, _len, _ref;
    if (volume == null) {
      volume = -1;
    }
    if (volume === -1) {
      volume = GG.gekijou.tb.getVolume();
    }
    _curev = this.current();
    if (_curev) {
      _ref = _curev.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ac = _ref[_i];
        if (ac.type === 'sound') {
          if (ac.sound) {
            ac.sound.setVolume(volume);
          }
        }
      }
    }
  };

  GEventManager.prototype.getClosetIndex = function(time) {
    var ev, i, tt, _i, _len, _ref;
    tt = 0;
    _ref = this.events;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      ev = _ref[i];
      if (tt > time) {
        return i - 1;
      }
      tt += ev.realtime();
    }
    return this.events.length - 1;
  };

  GEventManager.prototype.removeLine = function(line) {
    var ev, found, _i, _len, _ref;
    ev = this.current();
    found = false;
    if (ev) {
      if (ev.removeLine(line)) {
        found = true;
      }
    }
    if (!found) {
      _ref = this.events;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ev = _ref[_i];
        if (ev.removeLine(line)) {
          found = true;
        }
      }
    }
    return found;
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
            GG.gekijou.emit('step');
          }
        }
      } else {
        break;
      }
      tt += ev.realtime();
    }
    if (time >= this._timecount && this._curtime < this._timecount) {
      GG.gekijou.emit('end');
    }
    this._curtime = time;
    return this._currentIndex;
  };

  GEventManager.prototype.run = function() {
    if (this._event) {
      this.setVolume();
      this._event.run();
    }
  };

  GEventManager.prototype.length = function() {
    return this.events.length;
  };

  GEventManager.prototype.get = function(i) {
    return this.events[i];
  };

  GEventManager.prototype.del = function(i) {
    this.events.splice(i, 1);
  };

  GEventManager.prototype.insert = function(name, time) {
    var ev, id, _ref;
    if (time == null) {
      time = 2000;
    }
    if ((0 <= (_ref = this._currentIndex) && _ref < this.events.length - 1)) {
      id = this._lastid++;
      ev = new GEvent(id, name, time);
      this.events.splice(this._currentIndex + 1, 0, ev);
      this._event = ev;
      this._currentIndex++;
      this._timecount += ev.realtime();
    } else {
      ev = this.add(name, time);
    }
    return ev;
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
    } else {
      this._lastid = id + 1;
    }
    ev = new GEvent(id, name, time);
    this.events.push(ev);
    this._event = ev;
    this._currentIndex = this.events.length - 1;
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
