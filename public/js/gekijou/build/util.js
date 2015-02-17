var ControlBar, Editorbar, GGManager, Paginationbar, Playbar, Toolbar, Util,
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

  return Util;

})();

GGManager = (function() {
  function GGManager() {}

  return GGManager;

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
    this.$('.mpi').click(function() {
      GG.gekijou.emit('play');
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
    return this.$('.mpfo').html('');
  };

  Playbar.prototype.data = function(pns) {
    var html, i, name, pn, pos, _i, _len;
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
    this.$('.mpfo').html(html);
    this._data = pns;
    if (GG.env === 'dev') {
      this.$('.mpfi').click(function() {
        i = $(this).data('event-index');
        if (i >= 0) {
          GG.gekijou.reset();
          return GG.gekijou.play(i);
        }
      });
    }
  };

  Playbar.prototype.moveToLast = function() {
    var l, _ref;
    if (this._data.length > 0) {
      _ref = this._data, l = _ref[_ref.length - 1];
      return this.pos(l.pos);
    }
  };

  Playbar.prototype.moveToBegin = function() {
    this.pos(0);
  };

  Playbar.prototype.start = function() {
    this.$('.mpi').removeClass('mpir').addClass('mpip');
  };

  Playbar.prototype.pause = function() {
    this.$('.mpi').removeClass('mpip');
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
    this.pb = this.editor.gekijou.pb;
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

  Editorbar.prototype.bind = function() {
    var $gsavebtn, $newevbtn, self;
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
      time = modal.find('#newevent_time').val();
      if (name) {
        self.em.add(name, parseInt(time));
        self.gekijou.rearrange();
        moTool.hideModalBox(modal);
      }
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
    this.$('#inputboxtextarea').keypress(function(event) {
      if (event.which !== 13) {
        if (this.value.length >= index.mo.maxLength) {
          return event.preventDefault();
        }
      } else if (event.which === 13) {
        event.preventDefault();
        return self.$('#inputboxtextareapostbtn').click();
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
          return $textbox.val('');
        }
      } else {
        return moTool.showError('请先新建一个事件！');
      }
    });
  };

  return Editorbar;

})(ControlBar);
