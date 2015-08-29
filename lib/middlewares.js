'use strict';

var config = require('./../config');

var fs = require('fs'),
  path = require('path'),
  hat = require('hat');

var render = require('koa-ejs');

var logger = require('koa-logger'),
  session = require('koa-session'),
  parse = require('co-body'),
  multipartparse = require('co-busboy');

var SSOConnect;
if (config['sso'].service === 'theatre') {
  SSOConnect = require('./sso_theatre');
} else {
  SSOConnect = require('./sso');
}
var sso = new SSOConnect();

module.exports = function (app) {

  app.proxy = true;
  app.keys = config['security']['keyGrip'];

  if (config['app']['dev_mode']) {
    app.use(logger());
  }

  if (config['security']['trust_proxy']) {
    var ip_proxy_header = config['security']['trust_proxy'];
    app.use(function *(next) {
      var rip = this.headers[ip_proxy_header];
      if (rip) {
        this.__defineGetter__('ip', function () {
          return rip;
        });
        yield next;
      } else {
        this.status = 403;
      }
    });
  }

  app.use(session({key: config['app'].session_key}, app));

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

  if (config['app']['dev_mode'] && config['app']['fake_user']) {

    //fake user
    app.use(function *(next) {
      this.user = {
        id: 0,
        username: 'test',
        subtitle: '',
        iconid: 0,
        iconurl: 'http://static.missevan.cn/mimages/201409/24/e00d39ad91235577072505f5377fac52145452.png'
      };
      yield next;
    });

  } else {

  app.use(function *(next) {
    if (this.method) {
      //check token if have
      const SSO_COOKIE_NAME = config['sso'].token_cookie_name ? config['sso'].token_cookie_name : 'token';
      var token = this.cookies.get(SSO_COOKIE_NAME, { signed: false });
      var suser = this.session.user;
      if (token) {
        token = decodeURIComponent(token);
      }

      if (suser) {
        //check user
        if (suser.token === token) {
          var now = Math.floor(new Date().valueOf() / 1000);
          if (suser.expire > now) {
            this.user = suser;
          }
        }
      }

      if (token && !this.user) {
        //get user from token
        var r = yield sso.session(token);
        if (r && r.code === 0) {
          var user = SSOConnect.User(r.user, r.token, r.expire);
          this.session.user = user;
          this.user = user;
        } else if (r && r.code === 5) {
          //token错误
          this.cookies.set(SSO_COOKIE_NAME, '', { signed: false });
        }
      }

      if (suser && !this.user) {
        //delete session
        this.session = null;
      }
    }
    yield next;
  });

  }

  render(app, {
    cache: !config['app'].dev_mode, //开发模式关闭缓存
    root: config['sys'].root_dir + 'view',
    layout: false,
    viewExt: 'html',
    locals: config['web'].locals
  });

  app.use(function *(next) {
    var _render = this.render;
    //为view render locals添加request
    var optswrapper = function (opts) {
      if (!opts) {
        opts = {};
      }
      if (!opts.pageStyles) {
        opts.pageStyles = [];
      }
      opts.request = {
        originalUrl: this.request.originalUrl
      };
      return opts;
    };

    this.render = function *(templ, opts) {
      yield _render.call(this, templ,
        optswrapper.call(this, opts));
    };

    //check is mobile
    var userAgent = this.request.headers['user-agent'];
    if (userAgent) {
      this.isMobile = /(iPhone|iPod|BlackBerry|Android)/.test(userAgent);

      if (this.isMobile) {
        //为view render添加mobile路径
        this.render = function *(templ, opts) {
          yield _render.call(this, 'mobile/' + templ,
            optswrapper.call(this, opts));
        };
      }
    }

    yield next;
  });

  app.use(function *(next) {
    try {
      yield next;
    } catch (e) {
      if (config['app'].dev_mode) {
        console.log(e.stack);
      }
      this.body = {
        code: -2,
        message: e.message
      };
    }
  });
};
