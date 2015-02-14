
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
    this.pagination = new Paginationbar(this.el.find('.pagelist'));
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

  Chara.prototype.current = function() {
    if (this._sel >= 0) {
      return this.charas[this._sel].id;
    }
    return -1;
  };

  Chara.prototype.select = function(i) {
    if (i !== this._sel) {
      if (this._sel >= 0) {
        this.el.find(".charabox:eq(" + this._sel + ")").removeClass('selected');
      }
      if (i >= 0) {
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
    $modal = this.el.find('#charamodal #charauserlist');
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

  Chara.prototype.searchIcon = function() {
    var b, bs, i, p, self, title, type, url, _i, _len;
    self = this;
    url = '/person/iconlist?pagesize=6';
    title = this.el.find('#soundsearchinput').val();
    if (title) {
      url += '&title=' + encodeURIComponent(title);
    }
    bs = this.el.find('.s_m_t_r_b');
    type = 0;
    for (i = _i = 0, _len = bs.length; _i < _len; i = ++_i) {
      b = bs[i];
      if ($(b).hasClass('s_m_t_r_b_a')) {
        type = i;
        break;
      }
    }
    if (type > 0) {
      if (type > 2) {
        type = 4;
      }
      url += "&profiletype=" + type;
    }
    p = this.pagination.page();
    if (p) {
      url += '&p=' + p;
    }
    moTool.getAjax({
      url: url,
      callBack: function(data) {
        var c, iconusers, page, pagecount;
        iconusers = [];
        page = 1;
        pagecount = 0;
        if (data.state === 'success' && data.info) {
          iconusers = (function() {
            var _j, _len1, _ref, _results;
            _ref = data.info;
            _results = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              c = _ref[_j];
              _results.push({
                id: parseInt(c.user_id),
                username: c.username,
                subtitle: c.title,
                iconid: parseInt(c.id),
                iconurl: c.save_name,
                iconcolor: ''
              });
            }
            return _results;
          })();
          if (p) {
            page = p;
          }
          pagecount = 6;
        }
        self.updatePagination(page, pagecount);
        self.showIcons(iconusers);
      }
    });
  };

  Chara.prototype.updatePagination = function(page, pagecount) {
    return this.pagination.update(page, pagecount);
  };

  Chara.prototype.showIcons = function(iconusers) {
    var $modal, c, html, self, sender, strc, _i, _len;
    html = '';
    $modal = this.el.find('#charamodal #selecticonlist');
    $modal.html('');
    if (iconusers.length <= 0) {
      return;
    }
    for (_i = 0, _len = iconusers.length; _i < _len; _i++) {
      c = iconusers[_i];
      sender = chatBox.sender(c);
      strc = JSON.stringify(c);
      html += "<div data-user='" + strc + "' class=\"charaicon\">\n  <div class=\"chaticonbox\">\n    <img src=\"" + sender.icon + "\">\n  </div>\n  <div class=\"clear\"></div>\n</div>";
    }
    $modal.html(html);
    self = this;
    $modal.find('.charaicon').click(function() {
      self.showCreateModal($(this).data('user'));
    });
  };

  Chara.prototype.showCreateModal = function(user) {
    var $modal;
    $modal = $('#newcharamodal');
    $modal.find('#newchara_user').data('user', user);
    $modal.find('#newchara_username').val(user.username);
    $modal.find('#newchara_subtitle').val('');
    moTool.showModalBox($modal);
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
    this.el.find('.s_m_t_r_b').click(function() {
      self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass('s_m_t_r_b_a');
      return $(this).addClass('s_m_t_r_b_a');
    });
    this.el.find('#searchbtn').click(function() {
      self.searchIcon();
    });
    $('#newcharaokbtn').click(function() {
      var $modal, name, user;
      $modal = $('#newcharamodal');
      name = $modal.find('#newchara_username').val();
      if (name) {
        user = $modal.find('#newchara_user').data('user');
        user.username = name;
        user.subtitle = $modal.find('#newchara_subtitle').val();
        self.add(user);
        self.refresh();
        moTool.hideModalBox($modal);
      }
    });
    this.pagination.change(function() {
      self.searchIcon();
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
    this.searchIcon();
    cb();
  };

  return Chara;

})();
