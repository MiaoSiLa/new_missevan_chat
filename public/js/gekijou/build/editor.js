
/*
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/12
 */
var GekijouEditor;

GekijouEditor = (function() {
  function GekijouEditor(gekijou) {
    this.gekijou = gekijou;
  }

  GekijouEditor.prototype.init = function(cb) {
    this.gekijou.setOptions({
      env: 'dev'
    });
    return this.gekijou.init(function() {
      return chatBox.addInfo('我是M娘', '欢迎使用小剧场编辑器');
    });
  };

  return GekijouEditor;

})();
