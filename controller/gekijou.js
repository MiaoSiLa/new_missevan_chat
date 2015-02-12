
var Router = require('koa-router');

var validator = require('validator');

var gekijou = new Router();

gekijou.get('/new', function *() {
  yield this.render('gekijou/new', {
    title: '创建_小剧场_MissEvan',
    user: this.user,
    pageStyles: [
      '/css/gekijou/build/gekijou.css',
      '/css/gekijou/build/editor.css'
    ]
  });
});

module.exports = gekijou;
