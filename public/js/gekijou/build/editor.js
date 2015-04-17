
/*
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
 */
var GekijouEditor;

GekijouEditor = (function() {
  function GekijouEditor(gekijou) {
    this.gekijou = gekijou;
    this.eb = new Editorbar($('#inputbox'), this);
    GG.editor = this;
  }

  GekijouEditor.prototype.init = function(cb) {
    var self;
    self = this;
    this.eb.bind();
    this._id = this.eb.getId();
    this.gekijou.setOptions({
      env: 'dev'
    });
    this.gekijou.init(function() {
      self.gekijou.preload();
      chatBox.addInfo('我是M娘', '欢迎使用小剧场编辑器');
      if (cb != null) {
        cb();
      }
    });
  };

  GekijouEditor.prototype.generate = function() {
    var a, album, c, chara, charastr, e, em, script, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    chara = this.gekijou.chara;
    em = this.gekijou.em;
    album = this.gekijou.album;
    script = '';
    script = 'setup {\n';
    if (album.albums && album.albums.length) {
      script += "  album " + album.albums.join() + "\n";
    }
    script += '}\n\n';
    script += 'chara {\n';
    _ref = chara.charas;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      script += "  define " + c.id + " " + (JSON.stringify(c.username)) + " " + (JSON.stringify(c.subtitle)) + " {\n";
      script += "    icon " + c.iconid + " " + (JSON.stringify(c.iconurl)) + " " + (JSON.stringify(c.iconcolor)) + "\n";
      script += "  }\n";
    }
    script += '}\n\n';
    script += 'event {\n';
    _ref1 = em.events;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      e = _ref1[_j];
      script += "  define " + e.id + " " + (JSON.stringify(e.name)) + " " + (JSON.stringify(e.time)) + " {\n";
      _ref2 = e.actions;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        a = _ref2[_k];
        script += "    " + a.type + " ";
        switch (a.type) {
          case 'unknow':
            break;
          default:
            charastr = a.chara === -1 ? 'nochara' : "chara:" + a.chara;
            script += "" + charastr + " " + (JSON.stringify(a.val));
        }
        script += "\n";
      }
      script += "  }\n";
    }
    script += '}\n';
    return script;
  };

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
      vgeki._id = this._id;
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
