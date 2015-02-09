
chatBox.isMobile = true;

$(function() {
  index.soundBox.init();
  $('#addroom').addClass('roombar pie');
});

chatBox.loadRoomBarDown = function(el) {
  var $roomBarDownClass = el ? $(el) : $('.roombardown');

  $roomBarDownClass.click(function(event) {
    event.preventDefault();

    $(this).toggleClass('roombarup');
    $(this).parent().toggleClass('roombarheight');
  });
};
