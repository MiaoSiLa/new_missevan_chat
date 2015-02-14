
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

gekijou.get('/view', function *() {
  yield this.render('gekijou/view', {
    title: 'view_小剧场_MissEvan',
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

      var geki = {
        user_id: this.user.id,
        title: body.title,
        intro: body.intro,
        script: body.script
      };

      if (body._id) {
        if (!validator.isMongoId(body._id)) {
          r.message = '错误的参数';
          this.body = r;
          return;
        }
        geki._id = body._id;
      }

      var g;
      if (body._id) {
        g = new Gekijou({ _id: body._id });
        var gekij = yield g.find();
        if (!gekij) {
          r.code = 1;
          r.message = '没有找到该剧场';
          this.body = r;
          return;
        }
        if (gekij.user_id !== this.user.id) {
          r.code = 2;
          r.message = '非作者不能进行编辑';
          this.body = r;
          return;
        }
        g.set(geki);
      } else {
        g = new Gekijou(geki);
      }

      if (g.checkScript()) {
        if (body._id) {
          yield g.update();
          r.gekijou = geki;
        } else {
          r.gekijou = yield g.save();
        }
        r.code = 0;
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
