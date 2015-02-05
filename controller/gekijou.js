
var Router = require('koa-router');

var validator = require('validator');

var gekijou = new Router();

gekijou.get('/new', function *() {
  yield this.render('gekijou/new', {
    title: '创建_小剧场_MissEvan',
    user: this.user
  });
});

module.exports = gekijou;
