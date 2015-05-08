
chatBox.isMobile = true;

$(function() {
  index.soundBox.init();
  index.soundBox.playChat = function () {};
  index.soundBox.playChatStr = function () {};
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
