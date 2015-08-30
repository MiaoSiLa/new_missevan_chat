var SoundCollection;

SoundCollection = (function() {
  function SoundCollection() {
    this._soundurlmap = {};
    this._bmute = false;
  }

  SoundCollection.prototype.init = function(cb) {
    return soundManager.onready(function() {
      if (play.soundBox) {
        play.soundBox.playChat = function() {
          return false;
        };
      }
      if (cb != null) {
        cb();
      }
    });
  };

  SoundCollection.prototype.get = function(soundid, cb) {
    var url;
    url = "/api/sound/getsound?soundid=" + soundid;
    $.ajax({
      url: url,
      dataType: 'json',
      success: function(data) {
        cb(data);
      }
    });
  };

  SoundCollection.prototype.load = function(url, cb) {
    var s, soundUrl;
    soundUrl = url;
    s = soundManager.createSound({
      id: soundUrl,
      url: index.mo.soundPath + soundUrl,
      multiShot: false,
      onload: function() {
        if (cb != null) {
          cb();
        }
      }
    });
    s.load();
    return s;
  };

  SoundCollection.prototype.stopAll = function(nobg) {
    var k, s, url, _results;
    if (nobg == null) {
      nobg = false;
    }
    if (nobg) {
      _results = [];
      for (k in this._soundurlmap) {
        if (k !== 'background') {
          url = this._soundurlmap[k];
          if (url) {
            s = soundManager.getSoundById(url);
            if (s) {
              _results.push(s.stop());
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      return soundManager.stopAll();
    }
  };

  SoundCollection.prototype.pauseAll = function() {
    return soundManager.pauseAll();
  };

  SoundCollection.prototype.resumeAll = function() {
    return soundManager.resumeAll();
  };

  SoundCollection.prototype.mute = function(_bmute) {
    this._bmute = _bmute;
    if (this._bmute) {
      this.stopAll();
    }
  };

  SoundCollection.prototype.play = function(soundkey, url, cb) {
    var opts, prevUrl, s;
    prevUrl = this._soundurlmap[soundkey];
    if (prevUrl) {
      s = soundManager.getSoundById(prevUrl);
      if (s) {
        s.stop();
      }
    }
    if (url === 'stop' || !url) {
      this._soundurlmap[soundkey] = null;
      return;
    }
    if (this._bmute) {
      this._soundurlmap[soundkey] = null;
    } else {
      this._soundurlmap[soundkey] = url;
      s = soundManager.getSoundById(url);
      if (s) {
        opts = {};
        if (soundkey === 'background') {
          opts.onfinish = function() {
            return s.play(opts);
          };
        }
        s.play(opts);
      }
    }
    if (cb != null) {
      cb();
    }
  };

  SoundCollection.prototype.stop = function(soundkey) {
    var prevUrl, s;
    prevUrl = this._soundurlmap[soundkey];
    if (prevUrl) {
      s = soundManager.getSoundById(prevUrl);
      if (s) {
        s.stop();
      }
      this._soundurlmap[soundkey] = null;
    }
  };

  return SoundCollection;

})();
