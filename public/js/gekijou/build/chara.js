
/*
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
 */
var Chara;

Chara = (function() {
  function Chara(el) {
    this.el = el;
    this.iconUrlPrefix = 'http://cdn.xiaojuchang.tv/avatars/';
    this.charas = [];
    this._lastid = 0;
    this._showmodal = false;
    this._sel = -1;
    this.pagination = new Paginationbar(this.el.find('.pagelist'));
  }

  Chara.prototype.add = function(c, id) {
    if (id == null) {
      id = -1;
    }
    if (id === -1) {
      id = this._lastid++;
    } else {
      this._lastid = Math.max(this._lastid, id + 1);
    }
    this.charas.push({
      id: id,
      username: c.username,
      showon: c.showon,
      iconid: c.iconid,
      iconurl: c.iconurl
    });
    return id;
  };

  Chara.prototype.sender = function(user) {
    var s;
    if (user) {
      s = {
        id: user.id,
        name: user.username,
        icon: this.iconUrlPrefix + user.iconurl
      };
    } else {
      s = null;
    }
    return s;
  };

  Chara.prototype.currentId = function() {
    if (this._sel >= 0) {
      return this.charas[this._sel].id;
    }
    return -1;
  };

  Chara.prototype.currentShowOn = function() {
    if (this._sel >= 0) {
      return this.charas[this._sel].showon;
    }
    return null;
  };

  Chara.prototype.selectId = function(id) {
    var c, found, i, _i, _len, _ref;
    found = false;
    _ref = this.charas;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      if (c.id === id) {
        found = true;
        this.select(i);
        break;
      }
    }
    if (!found) {
      this.select(-1);
    }
    return found;
  };

  Chara.prototype.removeId = function(id) {
    var c, i, _i, _len, _ref;
    _ref = this.charas;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      if (c.id === id) {
        this.remove(i);
        break;
      }
    }
  };

  Chara.prototype.select = function(i) {
    if (i !== this._sel) {
      if (this._sel >= 0) {
        this.el.find(".charabox:eq(" + this._sel + ")").removeClass('selected');
      }
      if (i >= this.charas.length) {
        i = -1;
      }
      if (i >= 0) {
        this.el.find(".charabox:eq(" + i + ")").addClass('selected');
        index.mo.sender = this.sender(this.charas[i]);
      } else {
        index.mo.sender = null;
      }
      this._sel = i;
    }
  };

  Chara.prototype.remove = function(i) {
    if (i === this._sel) {
      this.select(-1);
    }
    this.charas.splice(i, 1);
    this.refresh();
  };

  Chara.prototype.refresh = function() {
    var $modal, c, html, i, name, self, sender, _i, _len, _ref;
    html = '';
    $modal = this.el.find('#charamodal #charauserlist');
    $modal.html('');
    if (this.charas.length <= 0) {
      return;
    }
    _ref = this.charas;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      sender = this.sender(c);
      name = GG.util.escape(c.username);
      html += "<div id=\"chara" + c.id + "\" class=\"charabox";
      if (i === this._sel) {
        html += ' selected';
      }
      html += '\">\n';
      if (GG.env === 'dev') {
        html += '<div class="delbtn">x</div>\n';
      }
      html += "  <div class=\"chaticonbox\">\n    <img alt=\"" + name + "\" title=\"" + name + "\" src=\"" + sender.icon + "\">\n  </div>\n  <div class=\"clear\"></div>\n  <div class=\"chatusername\" style=\"color:#ffffff;\">\n    <span>" + name + "</span>\n  </div>\n</div>";

      /*
      <div class="chatsubtitle">
        <span style="color:#91c0ed;">#{subtitle}</span>
      </div>
       */
    }
    $modal.html(html);
    self = this;
    $modal.find('.charabox').click(function() {
      var id, sid;
      sid = $(this).attr('id');
      id = parseInt(sid.replace('chara', ''));
      self.selectId(id);
    });
    $modal.find('.delbtn').click(function() {
      var id, sid;
      sid = $(this).parent().attr('id');
      id = parseInt(sid.replace('chara', ''));
      self.removeId(id);
      return false;
    });
  };

  Chara.prototype.initIconCatalog = function() {
    var self, url;
    self = this;
    url = '/api/cataloglist/actor';
    moTool.getAjax({
      url: url,
      callBack: function(data) {
        if (data.state === 'success' && data.info) {
          self.updateCatalog(data.info);
        }
      }
    });
  };

  Chara.prototype.searchIcon = function() {
    var b, bs, i, p, query, self, type, url, _i, _len;
    self = this;
    url = '/api/iconlist?pagesize=12';
    query = this.el.find('#soundsearchinput').val();
    if (query) {
      url += '&name=' + encodeURIComponent(query);
    }
    bs = this.el.find('.s_m_t_r_b');
    type = 0;
    for (i = _i = 0, _len = bs.length; _i < _len; i = ++_i) {
      b = bs[i];
      if ($(b).hasClass('s_m_t_r_b_a')) {
        type = $(b).data('catalog');
        break;
      }
    }
    if (type > 0) {
      url += "&catalog=" + type;
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
                username: c.name,
                iconid: parseInt(c.id),
                iconurl: c.avatar
              });
            }
            return _results;
          })();
          if (p) {
            page = p;
          }
          pagecount = data.pagecount;
        }
        self.updatePagination(page, pagecount);
        self.showIcons(iconusers);
      }
    });
  };

  Chara.prototype.updateCatalog = function(icon_catalogs) {
    var html, ic, self, _i, _len;
    self = this;
    html = '<div class="s_m_t_r_b btn-default s_m_t_r_b_a">全部头像</div>\n';
    for (_i = 0, _len = icon_catalogs.length; _i < _len; _i++) {
      ic = icon_catalogs[_i];
      html += '<div class="s_m_t_r_b btn-default" data-catalog="' + ic.id + '">' + ic.catalog_name + '</div>\n';
    }
    this.el.find('.s_m_t_r').html(html);
    this.el.find('.s_m_t_r_b').click(function() {
      if (!$(this).hasClass('s_m_t_r_b_a')) {
        self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass('s_m_t_r_b_a');
        $(this).addClass('s_m_t_r_b_a');
      }
      self.el.find('#soundsearchinput').val('');
      self.pagination.page(1);
      self.searchIcon();
    });
  };

  Chara.prototype.updatePagination = function(page, pagecount) {
    return this.pagination.update(page, pagecount);
  };

  Chara.prototype.showIcons = function(iconusers) {
    var $modal, c, html, name, self, sender, strc, _i, _len;
    html = '';
    $modal = this.el.find('#charamodal #selecticonlist');
    $modal.html('');
    if (iconusers.length <= 0) {
      return;
    }
    for (_i = 0, _len = iconusers.length; _i < _len; _i++) {
      c = iconusers[_i];
      sender = this.sender(c);
      strc = JSON.stringify(c);
      name = GG.util.escape(c.username);
      html += "<div data-user='" + strc + "' class=\"charaicon\">\n  <div class=\"chaticonbox\">\n    <img alt=\"" + name + "\" title=\"" + name + "\" src=\"" + sender.icon + "\">\n  </div>\n  <div class=\"clear\"></div>\n</div>";
    }
    $modal.html(html);
    self = this;
    $modal.find('.charaicon').click(function() {
      self.showCreateModal($(this).data('user'));
    });
  };

  Chara.prototype.appendCandidateIcons = function(avatars, mainIconUrl) {
    var $ci, $modal, ava, html, self, _i, _len;
    $modal = $('#newcharamodal');
    $ci = $modal.find('.candidate-icons');
    if (!avatars || avatars.length <= 0) {
      $ci.html('');
      return;
    }
    html = '<img data-iconurl="' + mainIconUrl + '" src="' + this.iconUrlPrefix + mainIconUrl + '" />\n';
    for (_i = 0, _len = avatars.length; _i < _len; _i++) {
      ava = avatars[_i];
      html += '<img data-iconurl="' + ava.avatar + '" src="' + this.iconUrlPrefix + ava.avatar + '" />\n';
    }
    $ci.html(html);
    self = this;
    $ci.find('img').click(function() {
      var $il, $mi, $this, iconurl;
      $this = $(this);
      $il = $this.parents('#newchara_iconlist');
      $mi = $il.find('.main-icon');
      iconurl = $this.data('iconurl');
      $mi.data('iconurl', iconurl);
      $mi.attr('src', self.iconUrlPrefix + iconurl);
    });
  };

  Chara.prototype.showCreateModal = function(user) {
    var $il, $modal, html, mainIconUrl, self, url;
    $modal = $('#newcharamodal');
    $modal.find('#newchara_user').data('user', user);
    $modal.find('#newchara_username').val(user.username);
    self = this;
    mainIconUrl = user.iconurl;
    url = '/api/actor?id=' + user.iconid;
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
        if (data && data.state === 'success') {
          self.appendCandidateIcons(data.avatars, mainIconUrl);
        }
      }
    });
    $il = $modal.find('#newchara_iconlist');
    html = '<img data-iconurl="' + mainIconUrl + '" class="main-icon" src="' + this.iconUrlPrefix + mainIconUrl + '" />';
    html += '<div class="candidate-icons">加载中…</div>';
    $il.html(html);
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
  };

  Chara.prototype.devbind = function() {
    var $chbtns, self;
    self = this;
    this.el.find('#selecticon').show();
    $chbtns = this.el.find('#charabtnlist');
    $chbtns.show();
    $chbtns.find('#nocharabtn').click(function() {
      self.select(-1);
    });
    this.el.find('#searchbtn').click(function() {
      self.pagination.page(1);
      self.searchIcon();
    });
    this.el.find('#soundsearchinput').keydown(function(e) {
      if (e.which === 13) {
        self.pagination.page(1);
        self.searchIcon();
      }
    });
    $('#newcharaokbtn').click(function() {
      var $modal, iconurl, name, showon, user;
      $modal = $('#newcharamodal');
      name = $modal.find('#newchara_username').val();
      if (name) {
        user = $modal.find('#newchara_user').data('user');
        iconurl = $modal.find('#newchara_iconlist .main-icon').data('iconurl');
        showon = $modal.find('input[name=rd_chara_showon]:checked').val();
        user.username = name;
        user.iconurl = iconurl;
        user.showon = showon === 'right' ? 'right' : 'left';
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
    var user;
    this.bind();
    if (GG.env === 'dev') {
      this.devbind();
      if (this.charas.length > 0) {
        this.refresh();
      } else if (GG.user) {
        user = $.extend(GG.user);
        user.iconurl = user.avatar;
        this.selectId(this.add(user));
        this.refresh();
      }
      this.initIconCatalog();
      this.searchIcon();
    } else {
      this.el.addClass('non-editor');
      this.refresh();
    }
    cb();
  };

  Chara.prototype.parse = function(block_script) {
    var b, blocks, c, cid, i, iconi, line, lineprops, lines, props, reg_num, _i, _j, _len, _len1;
    blocks = GG.util.splitblock(block_script);
    for (_i = 0, _len = blocks.length; _i < _len; _i++) {
      b = blocks[_i];
      props = GG.util.splitprop(b.title);
      lines = GG.util.splitline(b.content);
      if (props.length >= 2 && props[0] === 'define' && lines.length > 0) {
        try {
          cid = parseInt(props[1]);
          c = {
            id: cid,
            username: JSON.parse(props[2]),
            subtitle: ''
          };
          for (i = _j = 0, _len1 = lines.length; _j < _len1; i = ++_j) {
            line = lines[i];
            lineprops = GG.util.splitprop(line);
            switch (lineprops[0]) {
              case 'actor':
                if (lineprops.length >= 2) {
                  c.iconid = parseInt(lineprops[1]);
                }
                break;
              case 'icon':
                if (lineprops.length >= 2) {
                  iconi = 1;
                  reg_num = /^[0-9]+$/;
                  if (reg_num.test(lineprops[1])) {
                    c.iconid = parseInt(lineprops[1]);
                    iconi++;
                  }
                  c.iconurl = JSON.parse(lineprops[iconi]);
                  if (lineprops[iconi + 1]) {
                    c.iconcolor = JSON.parse(lineprops[iconi + 1]);
                  }
                }
                break;
              case 'showon':
                if (lineprops.length >= 2) {
                  c.showon = lineprops[1] === 'right' ? 'right' : 'left';
                }
                break;
              case 'subtitle':
                if (lineprops.length >= 2 && lineprops[1]) {
                  c.subtitle = JSON.parse(lineprops[1]);
                }
            }
          }
          this.add(c, cid);
        } catch (_error) {}
      }
    }
  };

  return Chara;

})();
