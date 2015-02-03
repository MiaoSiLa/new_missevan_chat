
var mount = require('koa-mount');

var Router = require('koa-router');
var chat = new Router();

module.exports = function (app) {

  chat.get('/', function *() {
    yield this.render('chat/index', {
      title: 'Dollars_社区_聊天室_MissEvan',
      user: this.user
    });
  });

  chat.get('/room', function *() {
    var title = 'Dollars_社区_聊天室_MissEvan';
    yield this.render('chat/room', {
      title: title,
      user: this.user
    });
  });

  chat.post('/newroom', function *() {
    var body = this.request.body;

  });

  app.use(mount('/chat', chat.middleware()));
};
