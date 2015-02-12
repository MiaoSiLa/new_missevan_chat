
var config = require('./../config');

var Router = require('koa-router');

var validator = require('validator');

var gekijou = new Router();

gekijou.get('/new', function *() {

  var pageStyles = config['app'].dev_mode ? [
    '/css/gekijou/build/gekijou.css',
    '/css/gekijou/build/editor.css'
  ] : [
    '/css/gekijou/gekijou.min.css',
    '/css/gekijou/editor.min.css'
  ];

  yield this.render('gekijou/new', {
    title: '创建_小剧场_MissEvan',
    user: this.user,
    pageStyles: pageStyles
  });

});

module.exports = gekijou;
