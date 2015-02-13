var ControlBar, Editorbar, Playbar, Toolbar, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Util = (function() {
  function Util() {}

  Util.prototype.init = function() {};

  return Util;

})();

ControlBar = (function() {
  function ControlBar(el) {
    this.el = el;
  }

  ControlBar.prototype.$ = function(selector) {
    return this.el.find(selector);
  };

  ControlBar.prototype.bind = function() {};

  return ControlBar;

})();

Playbar = (function(_super) {
  __extends(Playbar, _super);

  function Playbar(el) {
    this.el = el;
    Playbar.__super__.constructor.call(this, this.el);
    this._data = [];
  }

  Playbar.prototype.bind = function() {};

  Playbar.prototype.preload = function(p) {
    p *= 100;
    return this.$('.mppl').css('height', "" + p + "%");
  };

  Playbar.prototype.pos = function(p) {
    p *= 100;
    return this.$('.mpl').css('height', "" + p + "%");
  };

  Playbar.prototype.clear = function() {
    return this.$('.mpfo').html('');
  };

  Playbar.prototype.data = function(pns) {
    var html, name, pn, pos, _i, _len;
    html = '';
    for (_i = 0, _len = pns.length; _i < _len; _i++) {
      pn = pns[_i];
      pos = 100 - pn.pos * 100;
      name = moTool.boardReplaceTxt(pn.name);
      html += "<div id=\"event" + pn.id + "\" class=\"mpf\" style=\"top: " + pos + "%;\">\n  <div class=\"mpfl\"></div>\n  <div class=\"mpfi\"><span>" + name + "</span></div>\n</div>";
    }
    this.$('.mpfo').html(html);
    this._data = pns;
  };

  Playbar.prototype.moveToLast = function() {
    var l, _ref;
    if (this._data.length > 0) {
      _ref = this._data, l = _ref[_ref.length - 1];
      return this.pos(l.pos);
    }
  };

  return Playbar;

})(ControlBar);

Toolbar = (function(_super) {
  __extends(Toolbar, _super);

  function Toolbar(el) {
    this.el = el;
    Toolbar.__super__.constructor.call(this, this.el);
    this._display = {
      dm: true,
      sv: false,
      f: false
    };
  }

  Toolbar.prototype.display = function(item, newvalue) {
    if (newvalue != null) {
      this._display[item] = newvalue;
    }
    return this._display[item];
  };

  Toolbar.prototype["switch"] = function(item) {
    return this._display[item] = !this._display[item];
  };

  Toolbar.prototype.bind = function() {
    var self;
    self = this;
    this.$('.mpsv').click(function() {
      if (self["switch"]('sv')) {
        $(this).find('.mpsvo').show();
      } else {
        $(this).find('.mpsvo').hide();
      }
    });
    this.$('.mpcdm').click(function() {
      if (self["switch"]('dm')) {
        $(this).removeClass('mpcdmc');
      } else {
        $(this).addClass('mpcdmc');
      }
    });
    this.$('.mpcf').click(function() {
      if (self["switch"]('f')) {
        $(this).find('.mpcfu').show();
      } else {
        $(this).find('.mpcfu').hide();
      }
    });
  };

  return Toolbar;

})(ControlBar);

Editorbar = (function(_super) {
  __extends(Editorbar, _super);

  function Editorbar(el, editor) {
    this.el = el;
    this.editor = editor;
    Editorbar.__super__.constructor.call(this, this.el);
    this.gekijou = this.editor.gekijou;
    this.em = this.editor.gekijou.em;
  }

  Editorbar.prototype.bind = function() {
    var self;
    self = this;
    this.$('#inputboxneweventbtn').click(function() {
      var modal, newid;
      modal = $('#neweventmodal');
      newid = self.em.lastid() + 1;
      modal.find('#newevent_name').val("新事件 " + newid);
      moTool.showModalBox(modal);
    });
    $('#neweventokbtn').click(function() {
      var modal, name, time;
      modal = $('#neweventmodal');
      name = modal.find('#newevent_name').val();
      time = modal.find('#newevent_time').val();
      if (name) {
        self.em.add(name, parseInt(time));
        self.gekijou.rearrange();
        return moTool.hideModalBox(modal);
      }
    });
  };

  return Editorbar;

})(ControlBar);
