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
    self = this;
    cl.find('.contact_item').click(function() {
      var actorid, url;
      actorid = $(this).data('actorid');
      url = '/theatre/api/actor?id=' + actorid;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
          if (data && data.state === 'success') {
            self.load(data.info);
          }
        }
      });
    });
  };

  ContactList.prototype.load = function(actor) {
    var aa, box_bd, empty, profile;
    box_bd = $('.box .box_bd');
    empty = box_bd.find('.empty');
    profile = box_bd.find('.profile');
    if (!actor) {
      profile.hide();
      empty.show();
    } else {
      profile.find('img').attr('src', actor.front_cover);
      profile.find('.nickname').text(actor.name);
      profile.find('.signature').text(actor.signature);
      aa = profile.find('.action_area');
      if (parseInt(actor.homepage)) {
        aa.find('.button').attr('href', '/theatre/actor/space?actorid=' + actor.id);
        aa.show();
      } else {
        aa.hide();
      }
      empty.hide();
      profile.show();
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
