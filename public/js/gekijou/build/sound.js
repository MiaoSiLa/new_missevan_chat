var SoundCollection;

SoundCollection = (function() {
  function SoundCollection() {
    this._soundurlmap = {};
  }

  SoundCollection.prototype.init = function(cb) {
    return soundManager.onready(function() {
      if (cb != null) {
        return cb();
      }
    });
  };

  SoundCollection.prototype.stopAll = function() {
    return soundManager.stopAll();
  };

  SoundCollection.prototype.pauseAll = function() {
    return soundManager.pauseAll();
  };

  SoundCollection.prototype.resumeAll = function() {
    return soundManager.resumeAll();
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
    if (cb != null) {
      cb();
    }
  };

  return SoundCollection;

})();
