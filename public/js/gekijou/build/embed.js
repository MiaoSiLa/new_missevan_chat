var ContactList, DScrollbar, GekijouEmbed;

console.log('gekijou embed');

DScrollbar = (function() {
  function DScrollbar() {}

  DScrollbar.prototype.update = function($sb) {
    var $content, $sw, h, h_content, h_sb, ratio, scrollTop, top;
    $sw = $sb.parents('.scroll-wrapper');
    $content = $sw.find('.scroll-content');
    if ($content.length <= 0) {
      return;
    }
    h = $content.height();
    h_sb = $sb.height();
    h_content = $content.find('div').height();
    top = parseInt($sb.css('top').replace('px', ''));
    ratio = top / (h - h_sb);
    scrollTop = (h_content - h) * ratio;
    $content[0].scrollTop = scrollTop;
  };

  DScrollbar.prototype.init = function() {
    var sb, self, sw;
    sw = $('.scroll-wrapper');
    if (!(sw && sw.length)) {
      return;
    }
    sw.find('.scroll-content').scroll(function() {
      var $content, $sb, h, h_content, h_sb, ratio, top;
      $content = $(this);
      $sb = $content.parent().find('.scroll-bar');
      if ($sb.hasClass('draggable')) {
        return;
      }
      h = $content.height();
      h_sb = $sb.height();
      h_content = $content.find('div').height();
      ratio = this.scrollTop / (h_content - h);
      top = (h - h_sb) * ratio;
      $sb.css('top', top);
    });
    sb = sw.find('.scroll-bar');
    if (sb.draggable) {
      sb.draggable({
        axis: 'y',
        cursor: 'default',
        containParent: true
      });
      self = this;
      sb.mousemove(function(e) {
        if (e.button === 0 && e.buttons === 1) {
          self.update($(this));
        }
      });
    }
    sb.parent().click(function(e) {
      var $content, $sb, $sw, $this, h, h_content, h_sb, offsetY, scrollTop, top;
      $this = $(this);
      $sw = $this.parents('.scroll-wrapper');
      $content = $sw.find('.scroll-content');
      $sb = $this.find('.scroll-bar');
      if ($content.length <= 0) {
        return;
      }
      h = $content.height();
      h_sb = $sb.height();
      h_content = $content.find('div').height();
      top = parseInt($sb.css('top').replace('px', ''));
      offsetY = e.offsetY;
      if (offsetY < top) {
        scrollTop = $content[0].scrollTop - 50;
      } else if (offsetY > top + h_sb) {
        scrollTop = $content[0].scrollTop + 50;
      } else {
        return;
      }
      if (scrollTop < 0) {
        scrollTop = 0;
      } else if (scrollTop > h_content - h) {
        scrollTop = h_content - h;
      }
      $content[0].scrollTop = scrollTop;
    });
  };

  return DScrollbar;

})();

ContactList = (function() {
  function ContactList() {}

  ContactList.prototype.init = function() {
    var cl, self;
    cl = $('.contact_list');
    if (!(cl && cl.length)) {
      return;
    }
    this.init_state();
    self = this;
    cl.find('.contact_item').click(function() {
      var actorid, url;
      actorid = $(this).data('actorid');
      url = '/api/actor?id=' + actorid;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
          if (data && data.state === 'success') {
            self.load(data);
          }
        }
      });
    });
  };

  ContactList.prototype.init_state = function() {
    var self;
    this.pushState = window.history && window.history.pushState;
    if (this.pushState) {
      self = this;
      window.onpopstate = function(e) {
        if (e.state && e.state.actor) {
          self.load(e.state.actor, true);
        } else {
          window.location.reload();
        }
      };
    }
  };

  ContactList.prototype.update_url = function(actor_id, actor) {
    if (this.pushState) {
      if (actor_id) {
        window.history.pushState({
          actor: actor
        }, '', "/theatre/actor/profile?actorid=" + actor_id);
      } else {
        window.history.pushState({
          actor: actor
        }, '', '/theatre/actor');
      }
    }
  };

  ContactList.prototype.load = function(actor, popstate) {
    var $anal, $more_avatars, a, actor_id, box_bd, empty, gekijou_count, html, info, profile, script, shares_count, _i, _j, _len, _len1, _ref, _ref1;
    box_bd = $('.box .box_bd');
    empty = box_bd.find('.empty');
    profile = box_bd.find('.profile');
    actor_id = null;
    if (!actor || !actor.info) {
      profile.hide();
      empty.show();
    } else {
      info = actor.info;
      actor_id = info.id;
      profile.find('.nickname').text(info.name);
      profile.find('.signature').text(info.signature);
      profile.find('#profile-intro .detail').text((info.intro ? info.intro : '还没有填写'));
      profile.find('.avatar img').attr('src', info.avatar_url);
      $more_avatars = profile.find('.profile_more_avatars');
      if (actor.avatars && actor.avatars.length) {
        html = '\n';
        _ref = actor.avatars;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          html += '<img class="img lazy" src="' + a.avatar_url + '" />\n';
        }
        html += '<img class="img lazy img-first" src="' + info.avatar_url + '" style="display:none" />';
        $more_avatars.html(html);
        $more_avatars.show();
        $more_avatars.find('img').click(function() {
          var $profile, $this;
          $this = $(this);
          $this.parent().find('.img-first').show();
          $profile = $this.parents('.profile');
          $profile.find('.avatar img').attr('src', $this.attr('src'));
        });
      } else {
        $more_avatars.html('');
        $more_avatars.hide();
      }
      gekijou_count = actor.scripts ? actor.scripts.length : 0;
      shares_count = actor.shares ? actor.shares.length : 0;
      $anal = profile.find('.profile_analytics span strong');
      $($anal[0]).text(gekijou_count.toString());
      $($anal[1]).text(shares_count.toString());
      profile.find('#profile-gekijou a').attr('href', '/theatre/actor/scripts?actorid=' + info.id);
      profile.find('#profile-shares a').attr('href', '/theatre/actor/space?actorid=' + info.id);
      profile.find('#profile-shares .detail').text((shares_count > 0 ? "共 " + shares_count + " 条" : '还没有朋友圈'));
      if (gekijou_count) {
        html = '\n';
        _ref1 = actor.scripts;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          script = _ref1[_j];
          html += '<img class="profile_script_img" src="' + script.cover_url + '" />\n';
        }
        profile.find('#profile-gekijou .detail').html(html);
      } else {
        profile.find('#profile-gekijou .detail').text('还没有演过剧本');
      }
      empty.hide();
      profile.show();
    }
    if (!popstate) {
      this.update_url(actor_id, actor);
    }
  };

  return ContactList;

})();

GekijouEmbed = (function() {
  function GekijouEmbed() {}

  GekijouEmbed.prototype.load = function(chatid) {
    var chat_box, ifr, share_box;
    share_box = $('#share_box');
    chat_box = $('#chat_box');
    if (share_box.hasClass('box_active')) {
      return;
    }
    if (chatid) {
      share_box.addClass('box_active');
      chat_box.find('.box_bd').html('<iframe class="gekijou-embed" src="/gekijou/view/' + chatid + '"></iframe>');
      ifr = chat_box.find('iframe');
      ifr.load(function() {
        share_box.hide().removeClass('box_active');
        chat_box.show();
        ifr.focus();
      });
    } else {
      chat_box.find('.box_bd').html('');
      chat_box.hide();
      share_box.show();
    }
  };

  GekijouEmbed.prototype.back = function() {
    return this.load(false);
  };

  GekijouEmbed.prototype.insertcss = function() {
    var content, s;
    content = ".gekijou-embed {\n  width: 100%;\n  height: 100%;\n  border: none;\n}\n#chat_box .box_bd {\n  overflow: hidden;\n}";
    s = document.createElement('style');
    s.type = 'text/css';
    if (typeof s.textContent === 'string') {
      s.textContent = content;
    } else {
      s.styleSheet.cssText = content;
    }
    $('head').append(s);
  };

  GekijouEmbed.prototype.init = function() {
    var backbtn, cc, self, share_box;
    share_box = $('#share_box');
    if (!(share_box && share_box.length)) {
      return;
    }
    self = this;
    this.insertcss();
    backbtn = $('#chat_box .back');
    backbtn.click(function() {
      self.back();
    });
    cc = $('.content_chat');
    cc.click(function() {
      var chatid;
      chatid = $(this).data('chatid');
      self.load(chatid);
      return false;
    });
  };

  return GekijouEmbed;

})();

$(document).ready(function() {
  var cl, ds, ge;
  ge = new GekijouEmbed();
  ds = new DScrollbar();
  cl = new ContactList();
  ge.init();
  ds.init();
  cl.init();
});
