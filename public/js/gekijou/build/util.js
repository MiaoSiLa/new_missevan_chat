var ControlBar, Playbar, Toolbar,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
  }

  Playbar.prototype.bind = function() {};

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
