var ActionForm, ControlBar, Editorbar, GGManager, ImageTools, Paginationbar, Playbar, Toolbar, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Util = (function() {
  function Util() {}

  Util.prototype.init = function() {
    if (!String.prototype.trim) {
      String.prototype.trim = function() {
        return $.trim(this);
      };
    }
  };

  Util.prototype.escape = function(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  Util.prototype.unescape = function(str) {
    return str.replace(/&(#0?34|quot);/g, '"').replace(/&#0?39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  };

  Util.prototype.findquoteend = function(script, start) {
    var d, end, i, len;
    end = -1;
    i = start;
    len = script.length;
    d = script[i] === '\"';
    i++;
    while (i < len) {
      if (script[i] === '\\') {
        i++;
        switch (script[i]) {
          case 'u':
            i += 5;
            break;
          case 'x':
            i += 3;
            break;
          default:
            i++;
        }
      } else if ((d && script[i] === '\"') || (!d && script[i] === '\'')) {
        end = i;
        break;
      } else {
        i++;
      }
    }
    return end;
  };

  Util.prototype.findblockend = function(script, start) {
    var end, i, len;
    end = -1;
    i = start;
    len = script.length;
    while (i < len) {
      if (script[i] === '\'' || script[i] === '\"') {
        i = this.findquoteend(script, i);
        if (i === -1) {
          break;
        }
      } else if (script[i] === '{') {
        i = this.findblockend(script, i + 1);
        if (i === -1) {
          break;
        }
      } else if (script[i] === '}') {
        end = i;
        break;
      }
      i++;
    }
    return end;
  };

  Util.prototype.splitblock = function(script) {
    var blocks, content, i, ti, ti2, title;
    blocks = [];
    i = 0;
    while (true) {
      ti = script.indexOf('{', i);
      if (ti >= 0) {
        title = script.substring(i, ti);
        ti++;
        ti2 = this.findblockend(script, ti);
        if (ti2 >= 0) {
          content = script.substring(ti, ti2);
          blocks.push({
            title: title.trim(),
            content: content
          });
          i = ti2 + 1;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return blocks;
  };

  Util.prototype.splitprop = function(script) {
    var blank, found, i, iend, len, props;
    props = [];
    script = script.trim();
    if (script) {
      i = 0;
      iend = -1;
      len = script.length;
      blank = /\s/;
      while (i < len) {
        if (script[i] === '\"' || script[i] === '\'') {
          iend = this.findquoteend(script, i);
          if (iend === -1) {
            break;
          }
          iend++;
        } else if (blank.test(script[i])) {
          i++;
          continue;
        } else {
          iend = i + 1;
          found = false;
          while (iend < len) {
            if (blank.test(script[iend])) {
              found = true;
              break;
            }
            iend++;
          }
        }
        props.push(script.substring(i, iend));
        i = iend;
      }
    }
    return props;
  };

  Util.prototype.splitline = function(script) {
    var l, line, lines, _i, _len, _lines;
    lines = [];
    _lines = script.split('\n');
    for (_i = 0, _len = _lines.length; _i < _len; _i++) {
      line = _lines[_i];
      l = line.trim();
      if (l) {
        lines.push(l);
      }
    }
    return lines;
  };

  Util.prototype.splitsubcommand = function(key, val) {
    var ckey, clist, cscmd, subcmdname, subcmds, subkey, text, _i, _len;
    subcmds = {
      'sound': {
        'chara': ['chara', '角色', '人物'],
        'effect': ['effect', '音效'],
        'background': ['background', 'bgm', '背景乐']
      }
    };
    for (ckey in subcmds) {
      cscmd = subcmds[ckey];
      if (key === ckey) {
        text = val;
        for (subkey in cscmd) {
          clist = cscmd[subkey];
          for (_i = 0, _len = clist.length; _i < _len; _i++) {
            subcmdname = clist[_i];
            if (text.substr(0, subcmdname.length).toLowerCase() === subcmdname) {
              val = text.substr(0 + subcmdname.length).trim();
              return [key, subkey, val];
            }
          }
        }
      }
    }
    return [key, val];
  };

  Util.prototype.splitcommand = function(text) {
    var clist, cmdlist, cmdname, cmds, key, val, _i, _len;
    cmdlist = {
      'sound': ['sound', '声音', '音频'],
      'album': ['album', '专辑'],
      'state': ['state', '状态']
    };
    cmds = null;
    if (text[0] === '/') {
      for (key in cmdlist) {
        clist = cmdlist[key];
        for (_i = 0, _len = clist.length; _i < _len; _i++) {
          cmdname = clist[_i];
          if (text.substr(1, cmdname.length).toLowerCase() === cmdname) {
            val = text.substr(1 + cmdname.length).trim();
            cmds = this.splitsubcommand(key, val);
            return cmds;
          }
        }
      }
    }
    return cmds;
  };

  return Util;

})();

GGManager = (function() {
  function GGManager() {
    window.GG = this;
  }

  return GGManager;

})();

ActionForm = (function() {
  function ActionForm() {}

  ActionForm.prototype.bind = function() {
    $('form').submit(function(e) {
      return false;
    });
  };

  return ActionForm;

})();

ImageTools = (function() {
  function ImageTools() {}

  ImageTools.prototype.callback = function() {
    moTool.hideModalBox(this.modal);
    if (this.result && this.result.code === 0) {
      this.cb(null, this.type(), this.result.url);
    }
  };

  ImageTools.prototype.isextend = function() {
    return $('#inputbox').hasClass('full-editor');
  };

  ImageTools.prototype.progress = function(str) {
    this.modal.find('#img_upload_progress').text(str);
  };

  ImageTools.prototype.type = function() {
    return this.modal.find('input[type=radio]:checked').val();
  };

  ImageTools.prototype.initImageUpload = function(cb) {
    var dz, el, input, modal, self;
    this.cb = cb;
    self = this;
    dz = $('#chattop');
    el = dz;
    modal = $('#imagemodal');
    this.modal = modal;
    modal.find('#imageokbtn').click(function() {
      if (!$(this).hasClass('pending')) {
        self.callback();
      }
    });
    input = $('#imagefile input', el);
    input.bind('fileuploadprogress', function(e, data) {
      var p, strp;
      p = data.progress();
      if (p.loaded === p.total) {
        self.progress('上传完成，等待响应');
      } else {
        strp = (p.loaded * 100 / p.total).toFixed(1);
        self.progress(strp + '%');
      }
    });
    input.fileupload({
      url: 'http://backend1.missevan.cn/mimage/chatimage',
      dropZone: dz,
      dataType: 'json',
      multipart: true,
      add: function(e, data) {
        var curev;
        self.result = null;
        curev = GG.em.current();
        if (curev) {
          self.progress('0%');
          modal.find('#imageokbtn').addClass('pending');
          moTool.showModalBox(modal);
          data.submit().error(function() {
            self.progress('错误');
          });
        } else {
          moTool.showError('请先新建一个事件！');
        }
      },
      done: function(e, data) {
        var img, result;
        if (data && data.result) {
          result = data.result;
          self.result = data.result;
          if (result.code !== 0) {
            self.progress('错误');
          } else {
            self.progress('加载中');
            img = new Image();
            img.onload = function() {
              self.progress('完成');
              return modal.find('#imageokbtn').removeClass('pending');
            };
            img.src = result.url;
          }
        }
      }
    });
    $(document).bind('dragover', function(e) {
      var dropZone, found, node, timeout;
      dropZone = dz;
      timeout = window.dropZoneTimeout;
      if (!timeout) {
        dropZone.addClass('in');
      } else {
        clearTimeout(timeout);
      }
      found = false;
      node = e.target;
      while (node) {
        if (node === dropZone[0]) {
          found = true;
          break;
        }
        node = node.parentNode;
      }
      if (found) {
        dropZone.addClass('hover');
      } else {
        dropZone.removeClass('hover');
      }
      return window.dropZoneTimeout = setTimeout(function() {
        window.dropZoneTimeout = null;
        return dropZone.removeClass('in hover');
      }, 100);
    });
    return $('#fileuploadbtn', el).click(function() {
      return $('#imagefile input', el).click();
    });
  };

  return ImageTools;

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

Paginationbar = (function(_super) {
  __extends(Paginationbar, _super);

  function Paginationbar(el) {
    this.el = el;
    Paginationbar.__super__.constructor.call(this, this.el);
  }

  Paginationbar.prototype.update = function(page, pagecount) {
    var $pagelist, $pages, i, pa, pagenum, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref2, _results, _results1;
    $pagelist = this.el;
    this.p = page;
    if (pagecount != null) {
      this.pagecount = pagecount;
    } else {
      pagecount = this.pagecount;
    }
    if (page && pagecount) {
      if (page === 1) {
        $pagelist.find('.first, .previous').addClass('hidden');
      } else {
        $pagelist.find('.first').data('page', 1);
        $pagelist.find('.previous').data('page', page - 1);
        $pagelist.find('.first, .previous').removeClass('hidden');
      }
      if (page >= pagecount) {
        $pagelist.find('.next, .last').addClass('hidden');
      } else {
        $pagelist.find('.next').data('page', page + 1);
        $pagelist.find('.last').data('page', pagecount);
        $pagelist.find('.next, .last').removeClass('hidden');
      }
      $pagelist.find('> li').removeClass('selected');
      $pages = $pagelist.find('.page');
      if (pagecount <= 5) {
        for (i = _i = 0, _len = $pages.length; _i < _len; i = ++_i) {
          pa = $pages[i];
          $(pa).data('page', i + 1);
          if (i + 1 === page) {
            $(pa).addClass('selected');
          }
          if (i >= pagecount) {
            $(pa).addClass('hidden');
          } else {
            $(pa).removeClass('hidden');
          }
        }
      } else {
        $pages.removeClass('hidden');
        pagenum = [];
        if (page < 3) {
          pagenum = [1, 2, 3, 4, 5];
        } else if ((pagecount - 2 <= page && page <= pagecount)) {
          pagenum = (function() {
            _results = [];
            for (var _j = _ref = pagecount - 4; _ref <= pagecount ? _j <= pagecount : _j >= pagecount; _ref <= pagecount ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
        } else {
          pagenum = (function() {
            _results1 = [];
            for (var _k = _ref1 = page - 2, _ref2 = page + 2; _ref1 <= _ref2 ? _k <= _ref2 : _k >= _ref2; _ref1 <= _ref2 ? _k++ : _k--){ _results1.push(_k); }
            return _results1;
          }).apply(this);
        }
        for (i = _l = 0, _len1 = $pages.length; _l < _len1; i = ++_l) {
          pa = $pages[i];
          if (pagenum[i] === page) {
            $(pa).addClass('selected');
          }
          $(pa).data('page', pagenum[i]).find('a').text(pagenum[i]);
        }
      }
      $pagelist.show();
    } else {
      $pagelist.hide();
    }
  };

  Paginationbar.prototype.change = function(cb) {
    var self;
    self = this;
    this.$('> li').click(function() {
      var $this;
      $this = $(this);
      if (!$this.hasClass('selected')) {
        self.$('> li.selected').removeClass('selected');
        $this.addClass('selected');
        cb();
      }
    });
  };

  Paginationbar.prototype.page = function(p) {
    if (p != null) {
      if (p !== this.page) {
        this.update(p, this.pagecount);
      }
      return;
    }
    p = this.$('.selected').data('page');
    return parseInt(p);
  };

  return Paginationbar;

})(ControlBar);

Playbar = (function(_super) {
  __extends(Playbar, _super);

  function Playbar(el) {
    this.el = el;
    Playbar.__super__.constructor.call(this, this.el);
    this._lasthighlight = -1;
    this._data = [];
    this._wheelstatus = {};
  }

  Playbar.prototype.show = function(bshow) {
    if (bshow) {
      this.el.show();
    } else {
      this.el.hide();
    }
  };

  Playbar.prototype.bind = function() {
    var $mpo;
    this.$('.mpi').click(function() {
      GG.gekijou.emit('play');
    });
    this.$('.mpfo').click(function(e) {
      var $this, offsetY, pos;
      $this = $(this);
      offsetY = e.clientY - $this.offset().top;
      pos = 1 - offsetY / $(this).height();
      GG.gekijou.emit('pos', pos);
      return false;
    });
    $mpo = this.$('.mpo');
    this.$('.mplr').draggable({
      axis: 'y',
      containment: $mpo,
      drag: function() {
        GG.gekijou.emit('pause');
      },
      stop: function() {
        var $this, h, py, y, ypos;
        $this = $(this);
        y = $this.offset().top;
        py = $mpo.offset().top;
        h = $mpo.height();
        ypos = h - (y - py);
        $this.attr('style', '');
        GG.gekijou.emit('pos', ypos / h);
      }
    });
    if (GG.env !== 'dev') {
      this.$('.mpiloopo').click(function() {
        var $this;
        $this = $(this);
        if ($this.hasClass('mpiloopa')) {
          GG.gekijou.autoReplay(false);
          $this.removeClass('mpiloopa');
        } else {
          GG.gekijou.autoReplay(true);
          $this.addClass('mpiloopa');
        }
      });
      $(document).keydown(function(e) {
        switch (e.which) {
          case 32:
            GG.gekijou.emit('play');
            break;
          case 38:
            GG.gekijou.emit('pause');
            break;
          case 40:
            if (GG.gekijou.isplaying() && GG.bubble.isbottom()) {
              GG.gekijou.emit('next');
              return;
            }
        }
      });
      if (chatBox.isMobile) {
        this.bindMobile();
      } else {
        this.bindDesktop();
      }
    } else {
      $(document).keydown(function(e) {
        var i;
        switch (e.which) {
          case 38:
            if (GG.gekijou.isplaying()) {
              return;
            }
            i = GG.em.currentIndex();
            if (i + 1 >= GG.em.length()) {
              return;
            }
            GG.gekijou.moveTo(i + 1);
            break;
          case 40:
            if (GG.gekijou.isplaying()) {
              return;
            }
            i = GG.em.currentIndex();
            if (i - 1 < 0) {
              return;
            }
            GG.gekijou.moveTo(i - 1);
        }
      });
    }
  };

  Playbar.prototype.bindDesktop = function() {
    var self;
    self = this;
    $('#commentCanvas')[0].onmousewheel = function(e) {
      var wheeltype;
      wheeltype = false;
      if (e.deltaY < 0) {
        wheeltype = 'up';
      } else if (e.deltaY > 0) {
        wheeltype = 'down';
      }
      if (wheeltype) {
        if (self._wheelstatus.type !== wheeltype || new Date().valueOf() - self._wheelstatus.lasttime > 800) {
          self._wheelstatus = {
            type: wheeltype,
            lasttime: new Date().valueOf(),
            deltaY: e.deltaY,
            tigger: false
          };
        } else {
          self._wheelstatus.deltaY += e.deltaY;
        }
        self.onscroll();
      }
    };
  };

  Playbar.prototype.bindMobile = function() {
    var self;
    self = this;
    document.addEventListener('touchstart', function(e) {
      return self._wheelstatus = {
        touches: e.touches[0]
      };
    }, false);
    document.addEventListener('touchend', function(e) {
      var deltaY;
      deltaY = self._wheelstatus.touches.clientY - e.changedTouches[0].clientY;
      self._wheelstatus = {
        tigger: false,
        deltaY: deltaY
      };
      return self.onscroll();
    }, false);
  };

  Playbar.prototype.onscroll = function() {
    if (!this._wheelstatus.tigger) {
      if (this._wheelstatus.deltaY <= -3) {
        this._wheelstatus.tigger = true;
        if (GG.gekijou.isplaying()) {
          GG.gekijou.emit('pause');
        }
      } else if (this._wheelstatus.deltaY >= 3) {
        if (GG.bubble.isbottom()) {
          if (!GG.gekijou.isplaying()) {
            this._wheelstatus.tigger = true;
            if (!GG.gekijou.isfinished()) {
              GG.gekijou.emit('play');
            }
          } else if (this._wheelstatus.deltaY > 100) {
            this._wheelstatus.tigger = true;
            GG.gekijou.emit('next');
          }
        }
      }
    }
  };

  Playbar.prototype.preload = function(p) {
    p *= 100;
    return this.$('.mppl').css('height', "" + p + "%");
  };

  Playbar.prototype.pos = function(p) {
    p *= 100;
    return this.$('.mpl').css('height', "" + p + "%");
  };

  Playbar.prototype.clear = function() {
    return this.$('.mpfs').html('');
  };

  Playbar.prototype.data = function(pns) {
    var evlabels, html, i, name, pn, pos, self, _i, _len;
    html = '';
    for (i = _i = 0, _len = pns.length; _i < _len; i = ++_i) {
      pn = pns[i];
      pos = 100 - pn.pos * 100;
      name = GG.util.escape(pn.name);
      html += "<div id=\"event" + pn.id + "\" class=\"mpf\" style=\"top: " + pos + "%;\">\n  <div class=\"mpfl\"></div>";
      if (GG.env === 'dev') {
        html += "<div data-event-index=\"" + i + "\" class=\"mpfi\"><span>" + name + "</span></div>";
      }
      html += "</div>";
    }
    this.$('.mpfs').html(html);
    this._data = pns;
    if (GG.env === 'dev') {
      self = this;
      evlabels = this.$('.mpfi');
      evlabels.click(function(e) {
        var charaId;
        i = $(this).data('event-index');
        if (i >= 0) {
          charaId = GG.chara.currentId();
          if (GG.gekijou.isplaying()) {
            GG.gekijou.pause();
          }
          GG.gekijou.moveTo(i);
          if (GG.chara.currentId() !== charaId) {
            GG.chara.selectId(charaId);
          }
        }
        e.stopPropagation();
      });
      evlabels.dblclick(function(e) {
        var ev, modal;
        i = $(this).data('event-index');
        if (i >= 0) {
          ev = GG.em.get(i);
        }
        if (ev) {
          modal = $('#editeventmodal');
          modal.data('event-index', i);
          modal.find('#editevent_name').val(ev.name);
          modal.find('#editevent_time').val(ev.time);
          moTool.showModalBox(modal);
        }
        e.stopPropagation();
        return false;
      });
    }
  };

  Playbar.prototype.highlight = function(i) {
    var ev, eventid;
    if (GG.env === 'dev') {
      if (this._lasthighlight >= 0) {
        eventid = '#event' + this._lasthighlight;
        this.$(eventid).removeClass('highlight');
      }
      ev = GG.em.get(i);
      if (ev) {
        eventid = '#event' + ev.id;
        this.$(eventid).addClass('highlight');
        this._lasthighlight = ev.id;
      } else {
        this._lasthighlight = -1;
      }
    }
  };

  Playbar.prototype.moveToIndex = function(i) {
    if ((0 <= i && i < this._data.length)) {
      this.pos(this._data[i].pos);
      this.highlight(i);
    }
  };

  Playbar.prototype.moveToLast = function() {
    var l, _ref;
    if (this._data.length > 0) {
      _ref = this._data, l = _ref[_ref.length - 1];
      this.pos(l.pos);
    }
  };

  Playbar.prototype.moveToBegin = function() {
    this.pos(0);
  };

  Playbar.prototype.start = function() {
    this.$('.mpi').removeClass('mpir').addClass('mpip');
  };

  Playbar.prototype.pause = function() {
    this.$('.mpi').removeClass('mpir').removeClass('mpip');
  };

  Playbar.prototype.finish = function() {
    this.$('.mpi').removeClass('mpip').addClass('mpir');
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

  Toolbar.prototype.refresh = function() {
    var $mppm;
    if (GG.env !== 'dev') {
      $mppm = this.$('.mppm');
      if (GG.opts['instantshow']) {
        return $mppm.addClass('mppmis');
      } else {
        return $mppm.removeClass('mppmis');
      }
    }
  };

  Toolbar.prototype.setVolume = function(volume) {
    this.$('.mpsvbl').css('width', volume);
    if (volume > 0) {
      this.$('.mpsv').removeClass('mpsvc');
    } else {
      this.$('.mpsv').addClass('mpsvc');
    }
    this._volume = volume;
    store.set('volume', volume);
    GG.em.setVolume(volume);
  };

  Toolbar.prototype.getVolume = function() {
    return this._volume;
  };

  Toolbar.prototype.initVolume = function() {
    var volume;
    volume = parseInt(store.get('volume'));
    if (!volume || volume !== 0) {
      volume = 100;
    }
    this.$('.mpsvblr').css('left', (100 - volume) / 100 * 88);
    this.$('.mpsvbl').css('width', volume);
    this._volume = volume;
  };

  Toolbar.prototype.initStatus = function() {
    var status;
    status = GG.gekijou.status;
    if (!status) {
      return;
    }
    if (status.good) {
      this.$('.mpcz').addClass('btnzg');
    }
    if (status.favorite) {
      this.$('.mpcs').addClass('mpcsg');
    }
  };

  Toolbar.prototype.bind = function() {
    var $mpsvblClass, $mpsvblrClass, self, statusUpdate, updateVolume;
    self = this;
    this.initVolume();
    this.initStatus();
    this.$('.mpsv').click(function() {
      if (self["switch"]('sv')) {
        $(this).find('.mpsvo').show();
      } else {
        $(this).find('.mpsvo').hide();
      }
    });
    $mpsvblClass = this.$('.mpsvbl');
    $mpsvblrClass = this.$('.mpsvblr');
    updateVolume = function() {
      var px, volume, x, xpos;
      x = $mpsvblrClass.offset().left;
      px = $mpsvblrClass.parent().offset().left;
      xpos = x - px;
      volume = (100 - xpos - 12) * 100 / 88;
      self.setVolume(volume);
    };
    $mpsvblrClass.draggable({
      axis: 'x',
      containment: 'parent',
      drag: function(e) {
        updateVolume();
      },
      stop: function() {
        updateVolume();
      }
    });
    $mpsvblClass.click(function(e) {
      var offsetX;
      offsetX = e.offsetX + 100 - $mpsvblClass.width();
      $mpsvblrClass.css('left', offsetX / 100 * 88);
      self.setVolume(100 - offsetX);
      e.stopPropagation();
    });
    $mpsvblrClass.click(function(e) {
      e.stopPropagation();
    });
    this.$('.mpsvo').click(function(e) {
      $mpsvblrClass.css('left', e.offsetX / 100 * 88);
      self.setVolume(100 - e.offsetX);
      e.stopPropagation();
    });

    /* Deprecated: danmaku button
    @$('.mpcdm').click ->
      if self.switch('dm')
        $(@).removeClass('mpcdmc')
      else
        $(@).addClass('mpcdmc')
      return
     */
    this.$('.mpcf').click(function() {
      if (self["switch"]('f')) {
        $(this).find('.mpcfu').show();
      } else {
        $(this).find('.mpcfu').hide();
      }
    });
    if (GG.env === 'dev') {
      this.$('.mpcz').hide();
      this.$('.mpcs').hide();
      this.$('.mppm').remove();
    } else {
      this.$('.mppm').click(function(e) {
        var $this;
        $this = $(this);
        if ($this.hasClass('mppmis')) {
          $this.removeClass('mppmis');
          GG.gekijou.setOptions({
            instantshow: false
          });
          GG.gekijou.pause();
          setTimeout(function() {
            GG.gekijou.reset();
            GG.gekijou.emit('play');
          }, 0);
        } else {
          $this.addClass('mppmis');
          GG.gekijou.setOptions({
            instantshow: true
          });
          GG.gekijou.pause();
          GG.gekijou.play();
        }
      });
      statusUpdate = function(stype, st, fn) {
        var staction;
        if (!GG.user) {
          if (fn != null) {
            fn(false);
          }
          return;
        }
        staction = st ? 'add' : 'remove';
        moTool.postAjax({
          url: "/gekijou/" + stype + "/" + staction,
          value: {
            _id: GG.gekijou._id
          },
          showLoad: false,
          callBack: function(data) {
            var success;
            success = data && data.code === 0;
            if (fn != null) {
              fn(success);
            }
          },
          showLoad: false,
          success: false,
          error: false,
          json: false
        });
      };
      this.$('.mpcz').click(function() {
        var $this, st;
        $this = $(this);
        st = $this.hasClass('btnzg');
        statusUpdate('good', !st, function(success) {
          if (success) {
            if (st) {
              $this.removeClass('btnzg');
            } else {
              $this.addClass('btnzg');
            }
          }
        });
      });
      this.$('.mpcs').click(function() {
        var $this, st;
        $this = $(this);
        st = $this.hasClass('mpcsg');
        statusUpdate('favorite', !st, function(success) {
          if (success) {
            if (st) {
              $this.removeClass('mpcsg');
              moTool.showSuccess('已成功取消收藏！');
            } else {
              $this.addClass('mpcsg');
              moTool.showSuccess('已成功添加收藏！');
            }
          }
        });
      });
    }
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
    this.pb = this.editor.gekijou.pb;
    this.imgtool = new ImageTools();
    this._extend = false;
    this._emotion_display = false;
  }

  Editorbar.prototype.setId = function(_id) {
    var $modal;
    $modal = $('#savemodal');
    $modal.find('#gekijou_id').val(_id);
    this.showpreview();
  };

  Editorbar.prototype.getId = function() {
    var $modal;
    $modal = $('#savemodal');
    return $modal.find('#gekijou_id').val();
  };

  Editorbar.prototype.showpreview = function() {
    var _id;
    _id = $('#savemodal #gekijou_id').val();
    if (_id) {
      $('#gekijoupreviewbtn').attr('href', "/gekijou/view/" + _id).show();
      return $('#gekijoudelbtn').show();
    }
  };

  Editorbar.prototype.extend = function(_ex) {
    var $textarea, self;
    if (_ex == null) {
      _ex = true;
    }
    if (!_ex === this._extend) {
      self = this;
      this._extend = !this._extend;
      $textarea = this.$('#inputboxtextarea');
      if (this._extend) {
        $textarea.val('');
        this.el.addClass('full-editor');
        setTimeout(function() {
          $textarea.replaceWith('<div id="inputboxtextarea" contentEditable="true"></div>');
          $textarea = self.$('#inputboxtextarea');
          $textarea.focus();
          $textarea.blur(function() {
            var html, s1, s2;
            html = $textarea.html();
            if (html.indexOf('<') !== -1) {
              s1 = html.replace(/<img [^>]*?src=(".+?")[^>]*?\/?>/gi, "|img:$1|");
              s1 = s1.replace(/<br\/?>/gi, '\n');
              s1 = s1.replace(/<div>(.*?)<\/div>/gi, '\n$1');
              s2 = s1.replace(/<.*?>/g, '');
              s2 = s2.replace(/\|img\:"(.+?)"\|/gi, "<img src=\"$1\" />");
              html = s2.replace(/\n/g, '<br>');
              $textarea.html(html);
            }
          });
        }, 300);
      } else {
        $textarea.html('');
        this.showemotion(false);
        this.el.removeClass('full-editor');
        setTimeout(function() {
          $textarea.replaceWith('<textarea id="inputboxtextarea" class="pie" placeholder="文字,弹幕,音频,中二咒语" maxlength="200"></textarea>');
          self.bindeditor();
          $textarea = self.$('#inputboxtextarea');
          $textarea.focus();
        }, 300);
      }
    }
  };

  Editorbar.prototype.showcmdbox = function(bshow) {
    var $inputboxcmdbox;
    $inputboxcmdbox = this.$('#inputboxcmdbox');
    if ($inputboxcmdbox.is(':visible') === bshow) {
      return;
    }
    if (bshow) {
      $inputboxcmdbox.show();
      setTimeout(function() {
        $inputboxcmdbox.css('max-height', 200);
      }, 0);
    } else {
      $inputboxcmdbox.css('max-height', 0);
      setTimeout(function() {
        $inputboxcmdbox.hide();
      }, 150);
    }
  };

  Editorbar.prototype.selectcmdbox = function(down) {
    var $inputboxcmdbox, $p, $ps, i, iselect, p, _i, _len;
    $inputboxcmdbox = this.$('#inputboxcmdbox');
    $ps = $inputboxcmdbox.find('p');
    iselect = -1;
    for (i = _i = 0, _len = $ps.length; _i < _len; i = ++_i) {
      p = $ps[i];
      $p = $(p);
      if ($p.hasClass('select')) {
        iselect = i;
        break;
      }
    }
    if (down) {
      if (iselect < $ps.length - 1) {
        if (iselect >= 0) {
          $($ps[iselect]).removeClass('select');
        }
        $($ps[iselect + 1]).addClass('select');
      }
    } else {
      if (!$inputboxcmdbox.is(':visible')) {
        return;
      }
      if (iselect >= 0) {
        $($ps[iselect]).removeClass('select');
      }
      if (iselect - 1 >= 0) {
        $($ps[iselect - 1]).addClass('select');
      }
    }
  };

  Editorbar.prototype.setcmd = function(cmd) {
    var $inputboxtextarea;
    $inputboxtextarea = this.$('#inputboxtextarea');
    if (cmd) {
      $inputboxtextarea.val(cmd);
      this.showcmdbox(false);
      $inputboxtextarea.focus();
    }
  };

  Editorbar.prototype.bindeditor = function() {
    var $inputboxcmdbox, $inputboxtextarea, self;
    self = this;
    $inputboxtextarea = this.$('#inputboxtextarea');
    $inputboxcmdbox = this.$('#inputboxcmdbox');
    $inputboxtextarea.keydown(function(e) {
      var $selp, cmd, _ref;
      if (self._extend) {
        return;
      }
      if (e.which === 8) {
        if ((2 <= (_ref = this.value.length) && _ref <= 4)) {
          self.showcmdbox(true);
        } else if (this.value.length <= 1) {
          self.showcmdbox(false);
        }
      } else if (e.which === 40) {
        e.preventDefault();
        self.showcmdbox(true);
        self.selectcmdbox(true);
      } else if (e.which === 38) {
        e.preventDefault();
        self.selectcmdbox(false);
      } else if (e.which === 13) {
        e.preventDefault();
        if ($inputboxcmdbox.is(':visible')) {
          $selp = $inputboxcmdbox.find('p.select');
          if ($selp && $selp.length > 0) {
            cmd = $selp.data('cmd');
            self.setcmd(cmd);
          }
        } else {
          self.$('#inputboxtextareapostbtn').click();
        }
      } else if (e.which === 191 || e.which === 47) {
        self.showcmdbox(true);
      } else {
        if (this.value.length >= index.mo.maxLength) {
          e.preventDefault();
        }
      }
    });
  };

  Editorbar.prototype.searchemotion = function() {
    var $input, query, self, url;
    self = this;
    url = '/api/emojilist';
    $input = $('#emotion-list .searchinput');
    query = $input.val();
    if (query) {
      url += '?name=' + query;
    }
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
        var $el, em, html, _i, _len, _ref;
        self._emotion_load = true;
        if (data && data.state === 'success') {
          if (data.info) {
            $el = $('#emotion-list .emotions');
            html = '';
            _ref = data.info;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              em = _ref[_i];
              html += '<img src="' + em.front_cover + '" title="' + GG.util.escape(em.title) + '" />';
            }
            $el.html(html);
            if (html) {
              $el.find('img').click(function() {
                var $textarea;
                if (self._extend) {
                  $textarea = self.$('#inputboxtextarea');
                  $textarea.append('<img src="' + $(this).attr('src') + '" />');
                }
              });
            }
          }
        }
      }
    });
  };

  Editorbar.prototype.showemotion = function(bshow) {
    var $elist, offset;
    if (bshow == null) {
      bshow = true;
    }
    $elist = $('#emotion-list');
    if (bshow) {
      if (!this._emotion_load) {
        this.searchemotion();
      }
      offset = this.$('#insert-emotion').offset();
      $elist.css('left', offset.left + 40).show().animate({
        left: offset.left + 50,
        opacity: 1
      });
      this._emotion_display = true;
    } else {
      $elist.hide().css('opacity', 0);
      this._emotion_display = false;
    }
  };

  Editorbar.prototype.bind = function() {
    var $exinput, $gsavebtn, $inputboxcmdbox, $inputboxtextarea, $insemotion, $newevbtn, $settingsbtn, self;
    self = this;
    $exinput = this.$('#extend-input');
    $exinput.click(function() {
      self.extend(!self._extend);
    });
    $insemotion = this.$('#insert-emotion');
    $insemotion.click(function() {
      self.showemotion(!self._emotion_display);
    });
    $('#emotion-list .searchbtn').click(function() {
      self.searchemotion();
    });
    $newevbtn = this.pb.$('#mpiloop');
    $newevbtn.addClass('mpiloopa newevent');
    $newevbtn.text('');
    $newevbtn.click(function() {
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
      time = parseInt(modal.find('#newevent_time').val());
      if (name && time >= 0) {
        self.em.insert(name, time);
        self.gekijou.rearrange(true);
        self.gekijou.played(self.em.currentIndex());
        moTool.hideModalBox(modal);
      }
    });
    $('#editeventokbtn').click(function() {
      var ev, i, modal, name, time;
      modal = $('#editeventmodal');
      i = modal.data('event-index');
      name = modal.find('#editevent_name').val();
      time = parseInt(modal.find('#editevent_time').val());
      if (name && time >= 0) {
        ev = self.em.get(i);
      }
      if (ev) {
        ev.name = name;
        ev.time = time;
        self.gekijou.rearrange(true);
        moTool.hideModalBox(modal);
      }
    });
    $('#editeventdelbtn').click(function() {
      var ev, i, modal;
      modal = $('#editeventmodal');
      i = modal.data('event-index');
      if (i >= 0) {
        if (confirm('确认删除该事件吗？')) {
          ev = self.em.del(i);
          self.gekijou.reset();
          self.gekijou.rearrange();
        } else {
          return;
        }
      }
      moTool.hideModalBox(modal);
    });
    $settingsbtn = this.pb.$('#mpisettings');
    $settingsbtn.click(function() {
      var modal;
      modal = $('#settingsmodal');
      modal.find('#cb_show_name').prop('checked', GG.opts['showname']);
      modal.find('#cb_instant_show').prop('checked', GG.opts['instantshow']);
      modal.find('#cb_bgm_sync').prop('checked', GG.opts['bgm_sync']);
      moTool.showModalBox(modal);
    });
    $('#settingsokbtn').click(function() {
      var modal, opts;
      modal = $('#settingsmodal');
      opts = {
        showname: modal.find('#cb_show_name').prop('checked'),
        instantshow: modal.find('#cb_instant_show').prop('checked'),
        bgm_sync: modal.find('#cb_bgm_sync').prop('checked')
      };
      GG.gekijou.setOptions(opts);
      moTool.hideModalBox(modal);
    });
    $gsavebtn = this.pb.$('#mpisave');
    $gsavebtn.click(function() {
      moTool.showModalBox($('#savemodal'));
    });
    $('#gekijouokbtn').click(function() {
      var $modal, intro, title;
      $modal = $('#savemodal');
      title = $modal.find('#gekijou_title').val();
      intro = $modal.find('#gekijou_intro').val();
      if (title) {
        moTool.hideModalBox($modal);
        self.editor.save(title, intro);
      }
    });
    $('#gekijoudelbtn').click(function() {
      if (confirm('确认删除该剧场？')) {
        self.editor["delete"](function(success) {
          if (success) {
            return setTimeout(function() {
              return window.location.href = '/gekijou/';
            }, 1000);
          }
        });
      }
    });
    $gsavebtn.show();
    $inputboxtextarea = this.$('#inputboxtextarea');
    $inputboxcmdbox = this.$('#inputboxcmdbox');
    this.bindeditor();
    $inputboxcmdbox.find('p').click(function() {
      var cmd;
      cmd = $(this).data('cmd');
      self.setcmd(cmd);
    });
    this.$('#inputboxtextareapostbtn').click(function() {
      var $textbox, curev, s1, text;
      curev = self.em.current();
      if (curev) {
        $textbox = self.$('#inputboxtextarea');
        if (self._extend) {
          text = $textbox.html();
          if (text) {
            s1 = text.replace(/<br\/?>/gi, '\n');
            s1 = s1.replace(/<div>(.*?)<\/div>/gi, '\n$1');
            curev.parseAction(s1, true);
            $textbox.html('');
          }
        } else {
          text = $textbox.val();
          if (text) {
            curev.parseAction(text);
            $textbox.val('');
            self.showcmdbox(false);
          }
        }
      } else {
        moTool.showError('请先新建一个事件！');
      }
    });
    this.imgtool.initImageUpload(function(err, type, url) {
      var $textarea, curcharaid, curev;
      if (err || typeof url !== 'string') {
        moTool.showError('图片上传失败');
        return;
      }
      curev = self.em.current();
      curcharaid = GG.chara.currentId();
      if (curev) {
        switch (type) {
          case 'chat':
            if (curcharaid >= 0) {
              if (self._extend) {
                $textarea = self.$('#inputboxtextarea');
                $textarea.append('<img src=' + JSON.stringify(url) + ' />');
              } else {
                curev.showImage(url);
              }
            } else {
              moTool.showError('请先选择一个角色');
            }
            break;
          case 'background':
            curev.switchBackground(url);
        }
      } else {
        moTool.showError('请先新建一个事件！');
      }
    });
  };

  return Editorbar;

})(ControlBar);
