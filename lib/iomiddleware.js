/**
* io middleware
* Author: tengattack
*
*/

var config = require('./../config');

var co = require('co');
var Cookies = require('cookies'),
  session = require('koa-session');

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

function createContext(app, socket, onerror) {
  var ctx = app.createContext(socket.handshake, {});

  ctx.onerror = onerror ? onerror : function (err) {
    if (config['app'].dev_mode) {
      console.error(err.stack);
    }
    socket.emit('errorinfo', err.message);
  };

  Object.defineProperty(ctx, 'socket', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: wrapSocket(ctx, socket)
  });

  return ctx;
}

function ioMiddleware(app, cb, onerror) {
  var fn = co.wrap(cb);
  return function (socket) {
    var ctx = createContext(app, socket, onerror);
    fn.call(ctx).catch(ctx.onerror);
  };
}

module.exports = ioMiddleware;
