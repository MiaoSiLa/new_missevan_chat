
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
    window.GG = new GGManager();
    GG.gekijou = this;
    GG.chara = this.chara;
    GG.em = this.em;
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
    gs = $('#gekijouscript');
    script = '';
    if (gs && gs.length > 0) {
      this.parse(gs.html());
    }
    this.chara.init(function() {
      if (cb != null) {
        return cb();
      }
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
    this.pb.moveToLast();
  };

  Gekijou.prototype.parse = function(script) {
    if (script) {
      script = script.trim();
    }
    if (script) {
      console.log(script);
    }
  };

  return Gekijou;

})();
