
/*
  Author: tengattack
  Version: 0.1.0
  Update: 2014/02/13
 */
var Chara;

Chara = (function() {
  function Chara(el) {
    this.el = el;
    this.charas = [];
    this._lastid = 0;
    this._showmodal = false;
    this._sel = -1;
  }

  Chara.prototype.add = function(c) {
    var id;
    id = this._lastid++;
    this.charas.push({
      id: id,
      username: c.username,
      subtitle: c.subtitle,
      iconurl: c.iconurl,
      iconcolor: c.iconcolor
    });
    return id;
  };

  Chara.prototype.select = function(i) {
    if (i !== this._sel) {
      if (this._sel > 0) {
        this.el.find(".charabox:eq(" + this._sel + ")").removeClass('selected');
      }
      if (i > 0) {
        this.el.find(".charabox:eq(" + i + ")").addClass('selected');
        index.mo.sender = chatBox.sender(this.charas[i]);
      } else {
        index.mo.sender = null;
      }
      this._sel = i;
    }
  };

  Chara.prototype.refresh = function() {
    var $modal, c, html, i, name, self, sender, subtitle, _i, _len, _ref;
    html = '';
    $modal = this.el.find('#charamodal');
    $modal.html('');
    if (this.charas.length <= 0) {
      return;
    }
    _ref = this.charas;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      sender = chatBox.sender(c);
      name = moTool.boardReplaceTxt(c.username);
      subtitle = moTool.boardReplaceTxt(c.subtitle);
      html += "<div id=\"chara" + c.id + "\" class=\"charabox";
      if (i === this._sel) {
        html += ' selected';
      }
      html += "\">\n  <div class=\"chaticonbox\">\n    <img src=\"" + sender.icon + "\">\n  </div>\n  <div class=\"clear\"></div>\n  <div class=\"chatusername\" style=\"color:#ffffff;\">\n    <span>" + name + "</span>\n  </div>\n  <div class=\"chatsubtitle\">\n    <span style=\"color:#91c0ed;\">" + subtitle + "</span>\n  </div>\n  <div class=\"delbtn\"></div>\n</div>";
    }
    $modal.html(html);
    self = this;
    $modal.find('.charabox').click(function() {
      var id, sid;
      sid = $(this).attr('id');
      id = parseInt(sid.replace('chara', ''));
      self.select(id);
    });
  };

  Chara.prototype.bind = function() {
    var $mpc, self;
    self = this;
    $mpc = this.el.find('.mpc');
    this.el.find('.sidetext').click(function() {
      if (self._showmodal) {
        $mpc.removeClass('showmodal');
      } else {
        $mpc.addClass('showmodal');
      }
      self._showmodal = !self._showmodal;
    });
  };

  Chara.prototype.init = function(cb) {
    var suser;
    this.bind();
    suser = $('#user').html();
    if (suser) {
      try {
        this.select(this.add(JSON.parse(suser)));
        this.refresh();
      } catch (_error) {}
    }
    cb();
  };

  return Chara;

})();
