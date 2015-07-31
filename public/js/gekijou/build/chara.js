
/*
  Author: tengattack
  Version: 0.1.3
  Update: 2014/03/13
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

  Chara.prototype.add = function(c, id) {
    if (id == null) {
      id = -1;
    }
    if (id === -1) {
      id = this._lastid++;
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
    var iconUrlPrefix, s;
    if (user) {
      iconUrlPrefix = 'http://static.missevan.cn/avatars/';
      s = {
        id: user.id,
        name: user.username,
        icon: iconUrlPrefix + user.iconurl
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
    var c, i, _i, _len, _ref;
    _ref = this.charas;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      if (c.id === id) {
        this.select(i);
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
      html += "\">\n  <div class=\"chaticonbox\">\n    <img alt=\"" + name + "\" title=\"" + name + "\" src=\"" + sender.icon + "\">\n  </div>\n  <div class=\"clear\"></div>\n  <div class=\"chatusername\" style=\"color:#ffffff;\">\n    <span>" + name + "</span>\n  </div>\n  <div class=\"delbtn\"></div>\n</div>";

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
  };

  Chara.prototype.searchIcon = function() {
    var b, bs, i, p, query, self, type, url, _i, _len;
    self = this;
    url = '/theatre/api/iconlist?pagesize=12';
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

  Chara.prototype.showCreateModal = function(user) {
    var $modal;
    $modal = $('#newcharamodal');
    $modal.find('#newchara_user').data('user', user);
    $modal.find('#newchara_username').val(user.username);
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
    this.el.find('.s_m_t_r_b').click(function() {
      if (!$(this).hasClass('s_m_t_r_b_a')) {
        self.el.find('.s_m_t_r_b.s_m_t_r_b_a').removeClass('s_m_t_r_b_a');
        $(this).addClass('s_m_t_r_b_a');
      }
      self.el.find('#soundsearchinput').val('');
      self.pagination.page(1);
      self.searchIcon();
    });
    this.el.find('#searchbtn').click(function() {
      self.pagination.page(1);
      self.searchIcon();
    });
    $('#newcharaokbtn').click(function() {
      var $modal, name, showon, user;
      $modal = $('#newcharamodal');
      name = $modal.find('#newchara_username').val();
      if (name) {
        user = $modal.find('#newchara_user').data('user');
        showon = $modal.find('input[name=rd_chara_showon]:checked').val();
        user.username = name;
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
    this.bind();
    if (GG.env === 'dev') {
      this.devbind();
      if (this.charas.length > 0) {
        this.refresh();
      } else if (GG.user) {
        this.selectId(this.add(GG.user));
        this.refresh();
      }
      this.searchIcon();
    } else {
      this.el.addClass('non-editor');
      this.refresh();
    }
    cb();
  };

  Chara.prototype.parse = function(block_script) {
    var b, blocks, c, cid, i, line, lineprops, lines, props, _i, _j, _len, _len1;
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
              case 'icon':
                if (lineprops.length >= 3) {
                  c.iconid = parseInt(lineprops[1]);
                  c.iconurl = JSON.parse(lineprops[2]);
                  if (lineprops[3]) {
                    c.iconcolor = JSON.parse(lineprops[3]);
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
