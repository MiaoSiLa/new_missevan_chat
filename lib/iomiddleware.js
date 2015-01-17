/**
* io middleware
* Author: tengattack
*
*/
var co = require('co');

function wrapSocket(ctx, socket) {
  socket.yon = function (ev, cb) {
    var fn = co.wrap(cb);
    socket.on(ev, function () {
      var args = Array.prototype.slice.call(arguments);
      fn.apply(ctx, args).catch(ctx.onerror);
    });
  };
  return socket;
}

function createContext(socket, onerror) {
  var ctx = new Object();
  ctx.onerror = onerror ? onerror : function (err) {
    console.error(err.stack);
    socket.emit("errorinfo", err.message);
  };
  ctx.socket = wrapSocket(ctx, socket);
  return ctx;
}

function ioMiddleware(cb, onerror) {
  var fn = co.wrap(cb);
  return function (socket) {
    var ctx = createContext(socket, onerror);
    fn.call(ctx).catch(ctx.onerror);
  };
}

module.exports = ioMiddleware;
