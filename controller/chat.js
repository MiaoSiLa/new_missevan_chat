
var mount = require('koa-mount');

var Router = require('koa-router');
var chat = new Router();

module.exports = function (app) {

  chat.get('/', function *() {
    yield this.render('chat/index', {
      title: 'Dollars_社区_聊天室_MissEvan'
    });
  });

  chat.get('/room', function *() {
    var title = 'Dollars_社区_聊天室_MissEvan';
    yield this.render('chat/room', {
      title: title
    });
  });

  app.use(mount('/chat', chat.middleware()));
};