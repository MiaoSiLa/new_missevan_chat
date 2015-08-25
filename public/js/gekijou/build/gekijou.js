
/*
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
 */
var Gekijou;

Gekijou = (function() {
  function Gekijou(opts) {
    this.opts = opts != null ? opts : {};
    this.bubble = new ChatBubble();
    this.pb = new Playbar($('#m'));
    this.tb = new Toolbar($('#common-toolbar'));
    this.chara = new Chara($('#chara-toolbar'));
    this.album = new SoundAlbum();
    this.sound = new SoundCollection();
    this.em = new GEventManager();
    this.util = new Util();
    this._playing = false;
    this._ready = false;
    this._playedtime = 0;
    new GGManager();
    GG.gekijou = this;
    GG.opts = this.opts;
    GG.bubble = this.bubble;
    GG.chara = this.chara;
    GG.album = this.album;
    GG.sound = this.sound;
    GG.em = this.em;
    GG.util = this.util;
  }

  Gekijou.prototype.setOptions = function(opts) {
    var k, v;
    for (k in opts) {
      v = opts[k];
      this.opts[k] = v;
      switch (k) {
        case 'env':
          GG.env = v;
          break;
        case 'showname':
          this.bubble.showname(v);
          break;
        case 'instantshow':
          this.sound.mute(v);
          this.tb.refresh();
          if (this.opts['env'] !== 'dev') {
            this.pb.show(!v);
          }
          break;
        case 'editormode':
          this.setOptions({
            instantshow: v === 'simple'
          });
      }
    }
    return this.opts;
  };

  Gekijou.prototype.initChatBox = function() {
    this.bubble.init();
    chatBox.loadChatOption();
    chatBox.loadUser();
    chatBox.insertPrivateBox = function() {};
    if (!chatBox.isMobile) {
      index.js.loadChatDm();
    }
  };

  Gekijou.prototype.initUser = function() {
    var $user, suser;
    $user = $('#user');
    if (!($user && $user.length > 0)) {
      return;
    }
    this.status = $user.data('status');
    suser = $user.data('user');
    if (suser && typeof suser === 'object') {
      GG.user = suser;
    }
  };

  Gekijou.prototype.init = function(cb) {
    var gs, script, self;
    this.initUser();
    this.initChatBox();
    this.pb.bind();
    this.tb.bind();
    this.album.init();
    this.util.init();
    gs = $('script#gekijouscript');
    script = '';
    if (gs && gs.length > 0) {
      this.setId(gs.data('id'));
      script = this.util.unescape(gs.text());
      this.parse(script);
    }
    self = this;
    this.chara.init(function() {
      self.sound.init(function() {
        if (cb != null) {
          return cb();
        }
      });
    });
  };

  Gekijou.prototype.rearrange = function(keep) {
    var i, len, pns;
    if (keep == null) {
      keep = false;
    }
    this.pb.clear();
    pns = this.em.calc();
    this.pb.data(pns);
    if (keep) {
      i = this.em.currentIndex();
      if (i >= 0) {
        this.pb.moveToIndex(i);
        return;
      }
    }
    if (GG.env !== 'dev') {
      this.pb.moveToBegin();
    } else {
      len = this.em.length();
      if (len > 0) {
        this.moveTo(len - 1);
      }
    }
  };

  Gekijou.prototype.parse = function(script) {
    var b, blocks, _i, _j, _k, _len, _len1, _len2;
    if (script) {
      script = script.trim();
    }
    if (script) {
      blocks = this.util.splitblock(script);
      for (_i = 0, _len = blocks.length; _i < _len; _i++) {
        b = blocks[_i];
        if (b.title === 'setup') {
          this.parseSetup(b.content);
        }
      }
      for (_j = 0, _len1 = blocks.length; _j < _len1; _j++) {
        b = blocks[_j];
        if (b.title === 'chara') {
          this.chara.parse(b.content);
        }
      }
      for (_k = 0, _len2 = blocks.length; _k < _len2; _k++) {
        b = blocks[_k];
        if (b.title === 'event') {
          this.em.parse(b.content);
        }
      }
      this.chara.select(0);
      this.album.load();
      this.rearrange();
    }
  };

  Gekijou.prototype.parseSetup = function(block) {
    var i, line, lineprops, lines, opt, _i, _len;
    lines = this.util.splitline(block);
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      line = lines[i];
      lineprops = this.util.splitprop(line);
      switch (lineprops[0]) {
        case 'album':
          this.album.set(lineprops[1]);
          break;
        case 'showname':
        case 'instantshow':
        case 'bgm_sync':
          opt = {};
          if (lineprops[1] === 'off') {
            opt[lineprops[0]] = false;
            this.setOptions(opt);
          } else if (lineprops[1] === 'on') {
            opt[lineprops[0]] = true;
            this.setOptions(opt);
          }
      }
    }
  };

  Gekijou.prototype.reset = function() {
    this.bubble.reset();
    this._finished = false;
    this._playedtime = 0;
    this.em.moveToBegin();
    this.pb.moveToBegin();
  };

  Gekijou.prototype.ready = function() {
    this._ready = true;
    $('#chatmain').addClass('gekijou-ready');
  };

  Gekijou.prototype.preload = function(cb) {
    var preload_step, res, self;
    res = this.em.getNeedPreload();
    if (res.length <= 0) {
      this.pb.preload(1);
      this.ready();
      if (cb != null) {
        cb();
      }
    } else {
      self = this;
      preload_step = function(i, cb2) {
        if (i >= res.length) {
          return cb2();
        } else {
          return res[i].action.load(function() {
            self.pb.preload(res[i].pos);
            return preload_step(i + 1, cb2);
          });
        }
      };
      preload_step(0, function() {
        self.pb.preload(1);
        self.ready();
        if (cb != null) {
          return cb();
        }
      });
    }
  };

  Gekijou.prototype.moveTo = function(i) {
    var curIndex, self;
    self = this;
    curIndex = this.em.currentIndex();
    this.reset();
    this.pb.moveToIndex(i);
    this.em.current(curIndex);
    this.sound.stopAll(true);
    this.em.switchTo(i);
    this.played(i);
    this.em.run();
  };

  Gekijou.prototype.emit = function(event, val) {
    this.on(event, val);
  };

  Gekijou.prototype.on = function(event, val) {
    var i, self;
    switch (event) {
      case 'pause':
        if (this._playing) {
          this.pause();
        }
        break;
      case 'play':
        if (this._playing) {
          this.pause();
        } else {
          if (this._finished) {
            this.reset();
          }
          this.play();
        }
        break;
      case 'next':
        if (!this._finished) {
          this.playNext();
        }
        break;
      case 'step':
        this.scrollToBottom();
        break;
      case 'pos':
        i = this.em.getClosetIndex(val * this.em.totaltime());
        if (i >= 0) {
          if (this._playing) {
            this.pause();
          }
          this.moveTo(i);
          this.play();
        }
        break;
      case 'end':
        this.finish();
        if (this.opts.autoReplay) {
          self = this;
          setTimeout(function() {
            self.reset();
            return self.play();
          }, 0);
        }
    }
  };

  Gekijou.prototype.autoReplay = function(enable) {
    this.setOptions({
      autoReplay: enable
    });
  };

  Gekijou.prototype.playNext = function() {
    if (this.em._currentIndex < this.em.events.length - 1) {
      this.played(this.em._currentIndex + 1);
    }
  };

  Gekijou.prototype.isplaying = function() {
    return this._playing;
  };

  Gekijou.prototype.isfinished = function() {
    return this._finished;
  };

  Gekijou.prototype.played = function(i) {
    this._playedtime = this.em.totaltime(i);
    if (this._playedtime <= 0) {
      return this._playedtime = 1;
    }
  };

  Gekijou.prototype.play = function(untilIndex) {
    var self;
    if (untilIndex == null) {
      untilIndex = -1;
    }
    if (this._playing) {
      return;
    }
    this._playing = true;
    this._finished = false;
    this.pb.start();
    this._lastplaytime = new Date().valueOf();
    self = this;
    if (this.opts['instantshow'] && this.opts['env'] !== 'dev') {
      this.sound.resumeAll();
      this.em.runAll();
    } else {
      this._timer = setInterval(function() {
        var curtime, i, pos;
        curtime = new Date().valueOf();
        self._playedtime += curtime - self._lastplaytime;
        self._lastplaytime = curtime;
        i = self.em.runAtTime(self._playedtime);
        pos = self._playedtime / self.em.totaltime();
        if (pos > 1) {
          pos = 1;
        }
        self.pb.pos(pos);
        if (i === untilIndex) {
          return self.pause();
        }
      }, 100);
      if (this._playedtime <= 0) {
        this.em.run();
      }
      this.sound.resumeAll();
    }
  };

  Gekijou.prototype.pause = function() {
    if (this._playing) {
      this._playing = false;
      clearInterval(this._timer);
      this._timer = 0;
      this.pb.pause();
      this.sound.pauseAll();
    }
  };

  Gekijou.prototype.finish = function() {
    if (this._finished) {
      return;
    }
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = 0;
    }
    this._playing = false;
    this._finished = true;
    this.sound.stopAll();
    this.pb.finish();
    if (GG.env !== 'dev') {
      moTool.postAjax({
        url: "/gekijou/addplaytimes",
        value: {
          _id: this._id
        },
        callBack: function(data) {},
        showLoad: false,
        success: false,
        error: false,
        json: false
      });
    }
  };

  Gekijou.prototype.run = function() {
    var self;
    self = this;
    setTimeout(function() {
      moTool.showModalBox($('#loadmodal'), {
        showClose: false
      });
      return self.preload(function() {
        moTool.hideModalBox($('#loadmodal'));
        return self.play();
      });
    }, 100);
  };

  Gekijou.prototype.setId = function(_id) {
    this._id = _id;
  };

  Gekijou.prototype.scrollToBottom = function() {
    this.bubble.tobottom();
  };

  return Gekijou;

})();
