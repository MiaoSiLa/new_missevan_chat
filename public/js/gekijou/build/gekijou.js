
/*
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
 */
var Gekijou;

Gekijou = (function() {
  function Gekijou(opts) {
    this.opts = opts != null ? opts : {};
    this.pb = new Playbar($('#m'));
    this.tb = new Toolbar($('#common-toolbar'));
    this.chara = new Chara($('#chara-toolbar'));
    this.em = new GEventManager();
    this.util = new Util();
    this._playing = false;
    this._ready = false;
    this._playedtime = 0;
    new GGManager();
    GG.gekijou = this;
    GG.chara = this.chara;
    GG.em = this.em;
    GG.util = this.util;
  }

  Gekijou.prototype.setOptions = function(opts) {
    var k, v;
    for (k in opts) {
      v = opts[k];
      if (k === 'env') {
        GG.env = v;
      }
      this.opts[k] = v;
    }
    return this.opts;
  };

  Gekijou.prototype.init = function(cb) {
    var gs, script;
    chatBox.loadChatOption();
    chatBox.loadUser();
    if (!chatBox.isMobile) {
      index.js.loadChatDm();
    }
    this.pb.bind();
    this.tb.bind();
    this.util.init();
    gs = $('script#gekijouscript');
    script = '';
    if (gs && gs.length > 0) {
      this.setId(gs.data('id'));
      script = this.unescape(gs.text());
      this.parse(script);
    }
    this.chara.init(function() {
      soundManager.onready(function() {
        if (cb != null) {
          return cb();
        }
      });
    });
  };

  Gekijou.prototype.rearrange = function() {
    var cur, e, pns, timecount, _i, _j, _len, _len1, _ref, _ref1;
    this.pb.clear();
    timecount = 0;
    _ref = this.em.events;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      timecount += e.time;
    }
    pns = [];
    cur = 0;
    _ref1 = this.em.events;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      e = _ref1[_j];
      pns.push({
        id: e.id,
        pos: cur / timecount,
        name: e.name
      });
      cur += e.time;
    }
    if (pns.length === 1) {
      pns[0].pos = 0.5;
    }
    this.pb.data(pns);
    if (GG.env === 'dev') {
      this.pb.moveToLast();
    } else {
      this.pb.moveToBegin();
    }
  };

  Gekijou.prototype.unescape = function(script) {
    return script.replace(/&(#0?34|quot);/g, '"').replace(/&#0?39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  };

  Gekijou.prototype.parse = function(script) {
    var b, blocks, _i, _j, _len, _len1;
    if (script) {
      script = script.trim();
    }
    if (script) {
      blocks = this.util.splitblock(script);
      for (_i = 0, _len = blocks.length; _i < _len; _i++) {
        b = blocks[_i];
        if (b.title === 'chara') {
          this.chara.parse(b.content);
        }
      }
      for (_j = 0, _len1 = blocks.length; _j < _len1; _j++) {
        b = blocks[_j];
        if (b.title === 'event') {
          this.em.parse(b.content);
        }
      }
      this.chara.select(0);
      this.rearrange();
    }
  };

  Gekijou.prototype.reset = function() {
    $('#chatbox').html('');
    this._finished = false;
    this._playedtime = 0;
    this.em.moveToBegin();
    this.pb.moveToBegin();
  };

  Gekijou.prototype.preload = function(cb) {
    var preload_step, res, self;
    res = this.em.getNeedPreload();
    if (res.length <= 0) {
      this.pb.preload(1);
      this._ready = true;
      cb();
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
        self._ready = true;
        return cb();
      });
    }
  };

  Gekijou.prototype.emit = function(event) {
    this.on(event);
  };

  Gekijou.prototype.on = function(event) {
    switch (event) {
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
      case 'end':
        this.finish();
        if (this.opts.autoReplay) {
          this.reset();
          this.play();
        }
    }
  };

  Gekijou.prototype.autoReplay = function(enable) {
    this.setOptions({
      autoReplay: enable
    });
  };

  Gekijou.prototype.isplaying = function() {
    return this._playing;
  };

  Gekijou.prototype.played = function(i) {
    return this._playedtime = this.em.totaltime(i);
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
    this._timer = setInterval(function() {
      var curtime, i, pos;
      curtime = new Date().valueOf();
      self._playedtime += curtime - self._lastplaytime;
      self._lastplaytime = curtime;
      i = self.em.runAtTime(self._playedtime);
      pos = self._playedtime / self.em.totaltime();
      self.pb.pos(pos);
      if (i === untilIndex) {
        return self.pause();
      }
    }, 100);
    if (this._playedtime <= 0) {
      this.em.run();
    }
  };

  Gekijou.prototype.pause = function() {
    if (this._playing) {
      this._playing = false;
      clearInterval(this._timer);
      this._timer = 0;
      this.pb.pause();
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

  return Gekijou;

})();
