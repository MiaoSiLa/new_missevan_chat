var SoundAlbum;

SoundAlbum = (function() {
  function SoundAlbum() {
    this.albums = [];
    this.sounds = [];
  }

  SoundAlbum.prototype.init = function() {
    return $('#soundmusic').click(function() {
      $('#chatmusic').fadeToggle(500);
    });
  };

  SoundAlbum.prototype.load = function(cb) {
    var albumid, len, loaded, _i, _len, _ref;
    $('#chatmusic').html('');
    if (this.albums.length > 0) {
      len = this.albums.length;
      loaded = 0;
      _ref = this.albums;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        albumid = _ref[_i];
        this.loadAlbum(albumid, function() {
          loaded++;
          if (loaded >= len) {
            if (cb != null) {
              cb();
            }
          }
        }, true);
      }
    } else {
      if (cb != null) {
        cb();
      }
    }
  };

  SoundAlbum.prototype.set = function(albumids) {
    var albumid, t, tids, _i, _len;
    t = typeof albumids;
    if (t === 'string') {
      tids = albumids.split(',');
      for (_i = 0, _len = tids.length; _i < _len; _i++) {
        albumid = tids[_i];
        albumid = parseInt(albumid);
        if (this.albums.indexOf(albumid) < 0) {
          this.albums.push(albumid);
        }
      }
    } else if (t === 'number') {
      this.albums.push(t);
    }
  };

  SoundAlbum.prototype.loadAlbum = function(albumid, cb, force) {
    var exist, self;
    exist = this.albums.indexOf(albumid) < 0;
    if (force || exist) {
      if (exist) {
        this.albums.push(albumid);
      }
      self = this;
      moTool.getAjax({
        url: "/sound/soundlist?albumid=" + albumid,
        showLoad: false,
        callBack: function(data) {
          var s, _i, _len, _ref;
          if (data && data.state === 'success') {
            if (data.info && data.info.sounds.length > 0) {
              _ref = data.info.sounds;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                s = _ref[_i];
                self.addSound(s);
              }
            }
          }
          if (cb != null) {
            cb();
          }
        }
      });
    } else {
      if (cb != null) {
        cb();
      }
    }
  };

  SoundAlbum.prototype.addSound = function(s) {
    var $music, self, soundid;
    if (!$('#sound' + s.id).length) {
      $music = $("<div id=\"sound" + s.id + "\" class=\"chatmusic\">\n  <div class=\"soundtitle\">" + s.soundstr + "</div>\n  <img title=\"标题: " + s.soundstr + "&#10;UP主: " + s.username + "&#10;声音ID: " + s.id + "\" src=\"" + s.front_cover + "\" />\n</div>");
      $music.prependTo($('#chatmusic'));
      if (GG.env === 'dev') {
        soundid = parseInt(s.id);
        self = this;
        $music.click(function() {
          GG.em.doAction('sound', soundid);
          return self.hideSelect();
        });
        return;
      }
    }
  };

  SoundAlbum.prototype.hideSelect = function() {
    var $chatmusic;
    $chatmusic = $('#chatmusic');
    if ($chatmusic.is(':visible')) {
      $chatmusic.fadeOut(500);
    }
  };

  SoundAlbum.prototype.showSelect = function() {
    var $chatmusic;
    $chatmusic = $('#chatmusic');
    if (!$chatmusic.is(':visible')) {
      $chatmusic.fadeIn(500);
    }
  };

  return SoundAlbum;

})();
