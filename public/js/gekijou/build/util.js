var ControlBar, Editorbar, GGManager, ImageTools, Paginationbar, Playbar, Toolbar, Util,
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
            cmds = [key, val];
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

ImageTools = (function() {
  function ImageTools() {}

  ImageTools.prototype.initImageUpload = function(cb) {
    var dz, el;
    dz = $('#chattop');
    el = dz;
    $('#imagefile input', el).fileupload({
      url: 'http://backend1.missevan.cn/mimage/chatimage',
      dropZone: dz,
      dataType: 'json',
      multipart: true,
      done: function(e, data) {
        var result;
        if (data && data.result) {
          result = data.result;
          if (result.code === 0) {
            cb(null, result.url);
            return;
          }
        }
        cb('failed');
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
    this._data = [];
  }

  Playbar.prototype.bind = function() {
    var $mpo;
    this.$('.mpi').click(function() {
      GG.gekijou.emit('play');
    });
    this.$('.mpfo').click(function(e) {
      var pos;
      pos = 1 - e.offsetY / $(this).height();
      GG.gekijou.emit('pos', pos);
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
      name = moTool.boardReplaceTxt(pn.name);
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
          GG.gekijou.reset();
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
      });
    }
  };

  Playbar.prototype.moveToIndex = function(i) {
    if ((0 <= i && i < this._data.length)) {
      this.pos(this._data[i].pos);
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

  Toolbar.prototype.setVolume = function(volume) {
    this.$('.mpsvbl').css('width', volume);
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

  Toolbar.prototype.bind = function() {
    var $mpsvblClass, $mpsvblrClass, self, updateVolume;
    self = this;
    this.initVolume();
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
    this.pb = this.editor.gekijou.pb;
    this.imgtool = new ImageTools();
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
      return $('#gekijoupreviewbtn').attr('href', "/gekijou/view/" + _id).show();
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

  Editorbar.prototype.bind = function() {
    var $gsavebtn, $inputboxcmdbox, $inputboxtextarea, $newevbtn, self;
    self = this;
    $newevbtn = this.pb.$('#mpiloop');
    $newevbtn.addClass('mpiloopa newevent');
    $newevbtn.text('+');
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
        ev = self.em.del(i);
        self.gekijou.reset();
        self.gekijou.rearrange();
      }
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
    $gsavebtn.show();
    $inputboxtextarea = this.$('#inputboxtextarea');
    $inputboxcmdbox = this.$('#inputboxcmdbox');
    $inputboxcmdbox.find('p').click(function() {
      var cmd;
      cmd = $(this).data('cmd');
      self.cmdbox(cmd);
    });
    $inputboxtextarea.keydown(function(e) {
      var $selp, cmd, _ref;
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
    this.$('#inputboxtextareapostbtn').click(function() {
      var $textbox, curev, text;
      curev = self.em.current();
      if (curev) {
        $textbox = self.$('#inputboxtextarea');
        text = $textbox.val();
        if (text) {
          curev.parseAction(text);
          $textbox.val('');
          self.showcmdbox(false);
        }
      } else {
        moTool.showError('请先新建一个事件！');
      }
    });
    this.imgtool.initImageUpload(function(err, url) {
      var curev;
      if (err) {
        moTool.showError('图片上传失败');
        return;
      }
      curev = self.em.current();
      if (curev) {
        curev.showImage(url);
      } else {
        moTool.showError('请先新建一个事件！');
      }
    });
  };

  return Editorbar;

})(ControlBar);
