
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
    this._id = this.eb.getId();
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

  GekijouEditor.prototype.generate = function() {};

  GekijouEditor.prototype.setId = function(_id) {
    this._id = _id;
    this.eb.setId(this._id);
  };

  GekijouEditor.prototype.save = function(title, intro, cb) {
    var self, vgeki;
    self = this;
    vgeki = {
      title: title,
      intro: intro,
      script: this.generate()
    };
    if (this._id) {
      vgeki._id = this.id;
    }
    moTool.postAjax({
      url: '/gekijou/save',
      value: vgeki,
      callBack: function(data) {
        var geki;
        geki = null;
        if (data) {
          if (data.code === 0) {
            geki = data.gekijou;
            if (geki && geki._id) {
              self.setId(geki._id);
            }
          } else if (data.message) {
            moTool.showError(data.message);
          } else {
            moTool.showError('未知错误');
          }
        }
        if (cb != null) {
          cb(geki);
        }
      },
      showLoad: true,
      success: false,
      error: false,
      json: false
    });
  };

  return GekijouEditor;

})();
