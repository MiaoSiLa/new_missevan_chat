
/*
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/12
 */
var Gekijou;

Gekijou = (function() {
  function Gekijou(opts) {
    this.opts = opts != null ? opts : {};
    this.pb = new Playbar($('#m'));
    this.tb = new Toolbar($('#toolbar'));
  }

  Gekijou.prototype.setOptions = function(opts) {
    var k, v;
    for (k in opts) {
      v = opts[k];
      this.opts[k] = v;
    }
    return this.opts;
  };

  Gekijou.prototype.init = function(cb) {
    chatBox.loadChatOption();
    chatBox.loadUser();
    if (!chatBox.isMobile) {
      index.js.loadChatDm();
    }
    this.pb.bind();
    this.tb.bind();
    cb();
  };

  Gekijou.prototype.parse = function(scripts) {};

  return Gekijou;

})();
