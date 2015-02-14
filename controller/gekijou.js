
var config = require('./../config');

var Router = require('koa-router'),
  validator = require('validator');

var Model = require('./../model'),
  Gekijou = Model.Gekijou;

var gekijou = new Router();

gekijou.get('/new', function *() {

  yield this.render('gekijou/new', {
    title: '创建_小剧场_MissEvan',
    user: this.user
  });

});

gekijou.post('/save', function *() {

  var r = { code: -1 };

  if (this.user && this.request.body) {
    var body = this.request.body;
    if (body.title && body.script && typeof body.title === 'string'
      && typeof body.script === 'string') {

      body.title = validator.trim(body.title);
      if (!validator.isLength(body.title, 2, 36)) {
        r.message = '标题的字数应在 2 ~ 36 个字之间';
        this.body = r;
        return;
      }

      if (body.intro && typeof body.intro === 'string') {
        body.intro = validator.trim(body.intro);
        if (!validator.isLength(body.intro, 0, 200)) {
          r.message = '介绍的字数应在 200 个字以内';
          this.body = r;
          return;
        }
      } else {
        body.intro = '';
      }

      var g = new Gekijou({
        user_id: this.user.id,
        title: body.title,
        intro: body.intro,
        script: body.script
      });

      if (g.checkScript()) {
        var ge = yield g.save();
        r.code = 0;
        r.gekijou = ge;
      } else {
        r.message = '错误的脚本';
      }
    } else {
      r.message = '错误的参数';
    }
  }

  this.body = r;
});

module.exports = gekijou;
