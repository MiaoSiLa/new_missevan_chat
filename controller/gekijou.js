'use strict';

var config = require('./../config');

var Router = require('koa-router'),
  validator = require('validator'),
  view = require('./../lib/view');

var GekijouScript = require('./../lib/gekijouscript');
var Model = require('./../model'),
  Gekijou = Model.Gekijou,
  GekijouStatus = Model.GekijouStatus;

var gekijou = new Router();

function *getGekijouStatus(gekijou_id, user_id) {
  /*if (user_id)*/ {
    // user.id must be integer
    var gs = new GekijouStatus();
    var gstatus = yield gs.getStatus(gekijou_id, user_id);
    if (gstatus) {
      delete gstatus._id;
      return gstatus;
    }
  }
  return {};
}

gekijou.get('/', function *() {
  var p = 1;
  if (this.query && this.query.p) {
    if (validator.isInt(this.query.p)) {
      p = parseInt(this.query.p);
    }
  }
  var g = new Gekijou();
  var gekis = yield g.getByPage(p);
  var pagecount = yield g.getPageCount();
  var pop_gekis = yield g.getPop(p);
  yield this.render('gekijou/index', {
    title: '小剧场_MissEvan',
    user: this.user,
    gekijous: gekis,
    pop_gekijous: pop_gekis,
    pagination: view.pagination(p, pagecount, '/gekijou')
  });
});

gekijou.get('/list', function *() {
  var p = 1;
  if (this.query && this.query.p) {
    if (validator.isInt(this.query.p)) {
      p = parseInt(this.query.p);
    }
  }
  var g = new Gekijou();
  var gekis = yield g.getByPage(p);
  var pagecount = yield g.getPageCount();

  this.body = {
    code: 0,
    page: p,
    pagecount: pagecount,
    gekijous: gekis
  };
});

gekijou.get('/new', function *() {
  if (!this.user) {
    this.redirect('/member/login?backurl=/gekijou/new');
    return;
  }

  yield this.render('gekijou/new', {
    title: '创建_小剧场_MissEvan',
    user: this.user,
    gekijou: null
  });
});

gekijou.get('/view/:gekijou_id', function *() {
  let title = '小剧场_MissEvan';
  var geki = null;
  if (this.params) {
    var _id = this.params.gekijou_id;
    if (_id && validator.isMongoId(_id)) {
      var g = new Gekijou({ _id: _id });
      geki = yield g.find();
      if (geki) {
        if (geki.title) {
          title = geki.title + '_' + title;
        }

        if (this.user) {
          geki.status = yield getGekijouStatus(geki._id, this.user.id);
        }
      }
    }
  }

  if (!geki) {
    this.status = 404;
    return;
  }

  yield this.render('gekijou/view', {
    title: title,
    user: this.user,
    gekijou: geki
  });
});

gekijou.get('/info/:gekijou_id', function *() {
  var geki = null;

  if (this.params) {
    var _id = this.params.gekijou_id;
    if (_id && validator.isMongoId(_id)) {
      var g = new Gekijou({ _id: _id });
      geki = yield g.find();
    }
  }

  if (geki) {

    if (this.user) {
      geki.status = yield getGekijouStatus(geki._id, this.user.id);
    }

    this.body = { code: 0, gekijou: geki };
  } else {
    //this.status = 404;
    this.body = { code: 1, message: 'Not Found' };
  }
});

function statusmwfn(stype) {
  var gsmethod = 'set' + stype[0].toUpperCase() + stype.substr(1);
  var gcoundmethod = stype + 'Count';
  return function *() {
    if (!this.params) {
      this.status = 404;
      return;
    }

    var r = { code: -1 };
    if (!this.request.body) {
      this.body = r;
      return;
    }
    if (!this.user) {
      this.body = { code: 2, message: 'User not login' };
      return;
    }

    var _id = this.request.body._id;
    if (_id && validator.isMongoId(_id)) {
      var st = -1;
      switch (this.params.action) {
        case 'add':
          st = 1;
          break;
        case 'remove':
          st = 0;
          break;
        default:
          break;
      }

      if (st !== -1) {
        var g = new Gekijou();
        var geki = yield g.find(_id);
        if (!geki || !geki._id) {
          // !geki.checked
          this.body = { code: 3, message: 'Gekijou not exists' };
          return;
        }

        var gs = new GekijouStatus();
        var result = yield gs[gsmethod](_id, this.user.id, st);
        if (result) {
          yield g[gcoundmethod](st);

          r.code = 0;
          r.status = gs.valueOf();
        } else {
          r.code = 1;
          r.message = 'Status update failed';
        }
      }
    }

    this.body = r;
  }
};

gekijou.post('/favorite/:action', statusmwfn('favorite'));
gekijou.post('/good/:action', statusmwfn('good'));

gekijou.post('/addplaytimes', function *() {
  var r = { code: -1 };
  if (this.request.body) {
    var _id = this.request.body._id;
    if (_id && validator.isMongoId(_id)) {
      // TODO: add limit
      var g = new Gekijou({ _id: _id });
      var geki = yield g.find();
      if (geki && geki._id && geki.checked) {
        yield g.playCount();
        r.code = 0;
      } else {
        r.code = 1;
      }
    }
  }
  this.body = r;
});

gekijou.get('/stats/:gekijou_id', function *() {
  if (this.params && this.params.gekijou_id) {
    var g = new Gekijou({ _id: this.params.gekijou_id });
    var geki = yield g.find();
    if (!geki) {
      this.status = 404;
      return
    }

    var gs = new GekijouScript();
    try {
      gs.parse(geki.script);
    } catch (e) {
      this.body = {
        code: 1,
        message: e.message()
      };
      return;
    }

    this.body = {
      code: 0,
      stats: {
        event: {
          count: gs.event.length,
          duration: gs.duration
        },
        chara: {
          count: gs.chara.length,
          charas: gs.get_charas()
        }
      }
    };
    return;
  }
  this.status = 404;
});

gekijou.get('/edit/:gekijou_id', function *() {
  if (!this.user) {
    if (this.params && this.params.gekijou_id) {
      this.redirect('/member/login?backurl=/gekijou/edit/' + this.params.gekijou_id);
    } else {
      this.status = 403;
    }
    return;
  }

  let title = '编辑_小剧场_MissEvan';
  var geki = null;
  if (this.params && this.params.gekijou_id) {
    var g = new Gekijou({ _id: this.params.gekijou_id });
    geki = yield g.find();
    if (geki) {
      title = geki.title + '_' + title;
    }
  }

  if (!geki) {
    this.status = 404;
    return;
  }

  if (geki.user_id !== this.user.id) {
    this.status = 403;
    return;
  }

  yield this.render('gekijou/new', {
    title: title,
    user: this.user,
    gekijou: geki
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
        username: this.user.username,
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
      } else {
        g = new Gekijou(geki);
      }

      if (g.checkScript()) {
        if (body._id) {
          yield g.update(geki);
          //r.gekijou = geki;
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

gekijou.post('/delete', function *() {
  var r = { code: -1 };

  if (this.user && this.request.body) {
    var body = this.request.body;
    if (body._id && typeof body._id === 'string') {
      var gekijou_id = body._id;
      var geki;
      var g = new Gekijou({ _id: gekijou_id });
      geki = yield g.find();

      if (!geki) {
        r.code = 1;
        r.message = '没有找到该剧场';
        this.body = r;
        return;
      }

      if (geki.user_id !== this.user.id) {
        r.code = 2;
        r.message = '非作者不能进行编辑';
        this.body = r;
        return;
      }

      if (yield g.remove()) {
        var gs = new GekijouStatus()
        yield gs.removeByGekijouId(gekijou_id);
        r.code = 0;
      }
    } else {
      r.message = '错误的参数';
    }
  }

  this.body = r;
});

module.exports = gekijou;
