
var config = require('./../config');

var fs = require('fs'),
  path = require('path'),
  hat = require('hat');

var render = require('koa-ejs');

var logger = require('koa-logger'),
  session = require('koa-session'),
  parse = require('co-body'),
  multipartparse = require('co-busboy');

var SSOConnect = require('./sso'),
  sso = new SSOConnect();

module.exports = function (app) {

  app.proxy = true;
  app.keys = config['security']['keyGrip'];

  if (config['app']['dev_mode']) {
    app.use(logger());
  }

  app.use(session(app));

  app.use(function *(next) {
    var have_files = false;
    if (this.request.is('multipart/*')) {
      var parts = multipartparse(this);
      var part;
      var body = {};
      var files = {};
      while (part = yield parts) {
        if (part.length) {
          // arrays are busboy fields
          body[part[0]] = part[1];
        } else {
          // otherwise, it's a stream
          var extName = path.extname(part.filename);
          var tmpFileName = hat(96, 36);
          var savepath = path.resolve(config['sys'].tmp_dir + tmpFileName);
          part.pipe(fs.createWriteStream(savepath));

          files[part.fieldname] = {
            filename: part.filename,
            mimeType: part.mimeType,
            extname: extName.toLowerCase(),
            savename: tmpFileName,
            savepath: savepath
          };

          have_files = true;
        }
      }
      this.request.body = body;
      this.request.files = files;
    } else if ('POST' == this.method) {
      this.request.body = yield parse(this);
    }

    //run next
    yield next;

    if (have_files) {
      //delete tmp files
      var files = this.request.files;
      for (var k in files) {
        fs.unlink(files[k].savepath, function () {});
      }
    }
  });

  app.use(function *(next) {
    if (this.method) {
      if (!this.session.user) {
        //check token if have
        var token = this.cookies.get('token', { signed: false });
        if (token) {
          token = decodeURIComponent(token);
          var r = yield sso.session(token);
          if (r && r.code === 0) {
            this.session.user = r.user;
            this.user = r.user;
          }
        }
      } else {
        this.user = this.session.user;
      }
    }
    yield next;
  });

  render(app, {
    root: config['sys'].root_dir + 'view',
    layout: false,
    viewExt: 'html',
    locals: config['web'].locals
  });

  app.use(function *(next) {
    try {
      yield next;
    } catch (e) {
      this.body = {
        code: -2,
        message: e.message
      };
    }
  });
};
