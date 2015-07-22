
var play = {};
chatBox.isMobile = true;

$(function() {
  /* adjust mobile soundBox for index.js */
  play.soundBox = index.soundBox;

  play.soundBox.init();
  play.soundBox.playChat = function () {};
  play.soundBox.playChatStr = function () {};
  // bg is black
  index.mo.bgType = 1;
});

chatBox.loadRoomBarDown = function(el) {
  var $roomBarDownClass = el ? $(el) : $('.roombardown');

  $roomBarDownClass.click(function(event) {
    event.preventDefault();

    $(this).toggleClass('roombarup');
    $(this).parent().toggleClass('roombarheight');
  });
};
