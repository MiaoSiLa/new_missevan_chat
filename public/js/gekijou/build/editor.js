
/*
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
 */
var GekijouEditor;

GekijouEditor = (function() {
  function GekijouEditor(gekijou) {
    this.gekijou = gekijou;
    this.eb = new Editorbar($('#inputbox'), this);
  }

  GekijouEditor.prototype.init = function(cb) {
    this.eb.bind();
    this.gekijou.setOptions({
      env: 'dev'
    });
    this.gekijou.init(function() {
      chatBox.addInfo('我是M娘', '欢迎使用小剧场编辑器');
      if (cb != null) {
        cb();
      }
    });
  };

  return GekijouEditor;

})();
