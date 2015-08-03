var ContactList, DScrollbar, GekijouEmbed;

console.log('gekijou embed');

DScrollbar = (function() {
  function DScrollbar() {}

  DScrollbar.prototype.init = function() {
    var sw;
    sw = $('.scroll-wrapper');
    if (!(sw && sw.length)) {
      return;
    }
    sw.find('.scroll-content').scroll(function() {
      var $sb, $this, h, h_content, h_sb, ratio, top;
      $this = $(this);
      $sb = $this.parent().find('.scroll-bar');
      h = $this.height();
      h_sb = $sb.height();
      h_content = $this.find('div').height();
      ratio = this.scrollTop / (h_content - h);
      top = (h - h_sb) * ratio;
      $sb.css('top', top);
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
    var chat_box, share_box;
    share_box = $('#share_box');
    chat_box = $('#chat_box');
    if (chatid) {
      chat_box.find('.box_bd').html('<iframe class="gekijou-embed" src="/gekijou/view/' + chatid + '"></iframe>');
      share_box.hide();
      chat_box.show();
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
