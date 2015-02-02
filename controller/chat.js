
var mount = require('koa-mount');

var Router = require('koa-router');
var chat = new Router();

module.exports = function (app) {

  chat.get('/', function *() {
    this.body = 'index';
  });

  app.use(mount('/chat', chat.middleware()));
};
