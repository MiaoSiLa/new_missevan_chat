'use strict';

function GekijouScript() {
}

function GekijouSyntaxError(err, pos, script) {
  this.err = err;
  this.line = 1;
  this.col = 1;
  for (let i = 0; i < pos; i++) {
    if (script[i] === '\n') {
      this.col = 1;
      this.line++;
    } else {
      this.col++;
    }
  }
}

GekijouSyntaxError.prototype.message = function () {
  return this.err;
};

GekijouScript.prototype.splitline = function (str) {
  var lines = [];
  var _lines = str.split('\n');

  for (let i = 0; i < _lines.length; i++) {
    let l = _lines[i].trim();
    if (l) {
      lines.push(l);
    }
  }

  return lines;
};

GekijouScript.prototype.splitprop = function (subscript) {
  var props = [];
  var script = subscript.trim();

  if (script) {
    var i = 0;
    var iend = -1;
    var len = script.length;
    var blank = /\s/;
    while (i < len) {
      if ((script[i] === '\"') || (script[i] === '\'')) {
        iend = this.findquoteend(script, i, true);
        if (iend === -1) {
          break;
        }
        iend++;
      } else if (blank.test(script[i])) {
        i++;
        continue;
      } else {
        iend = i + 1;
        var found = false;
        while (iend < len) {
          if (blank.test(script[iend])) {
            found = true;
            break;
          }
          iend++;
        }
      }

      props.push(script.substring(i, iend));
      i = iend;
    }
  }

  return props;
};

GekijouScript.prototype.findquoteend = function (subscript, start, nottest) {
  var end = -1;
  var i = start;
  var script = subscript ? subscript : this.script;
  var len = script.length;
  var d = script[i] === '\"';

  i++;
  while (i < len) {
    if (script[i] === '\\') {
      i++;
      switch (script[i]) {
        case 'u':
          // \uXXXX
          i += 5;
          break;
        case 'x':
          // \xXX
          i += 3;
          break;
        default:
          // \n ...
          i++;
          break;
      }
    } else if ((d && script[i] === '\"') || (!d && script[i] === '\'')) {
      end = i;
      break;
    } else if (script[i] === '\n') {
      // not allow change line
      break;
    } else {
      i++;
    }
  }

  if (!nottest) {
    if (end === -1) {
      throw new GekijouSyntaxError('couldn\'t find quotation end.', start, script);
    } else {
      var str = script.substring(start, end + 1);
      try {
        str = JSON.parse(str);
      } catch (e) {
        throw new GekijouSyntaxError('failed to parse quotation string.', start, script);
      }
    }
  }

  return end;
};

GekijouScript.prototype.findblockend = function (subscript, start) {
  var end = -1;
  var i = start;
  var j = -1;
  var script = subscript ? subscript : this.script;
  var len = script.length;
  while (i < len) {
    if (script[i] === '\'' || script[i] === '\"') {
      j = this.findquoteend(script, i);
      if (j === -1) {
        throw new GekijouSyntaxError('couldn\'t find quotation end.', i, script);
      }
      i = j;
    } else if (script[i] === '{') {
      j = this.findblockend(script, i + 1);
      if (j === -1) {
        throw new GekijouSyntaxError('couldn\'t find block end.', i, script);
      }
      i = j;
    } else if (script[i] === '}') {
      end = i;
      break;
    }

    i++;
  }

  if (end === -1) {
    throw new GekijouSyntaxError('couldn\'t find block end.', start, script);
  }

  return end;
};

GekijouScript.prototype.splitblock = function (subscript) {
  var blocks = [];
  var script = subscript ? subscript : this.script;

  var i = 0
  while (true) {
    let ti = script.indexOf('{', i);
    if (ti >= 0) {
      let title = script.substring(i, ti);
      ti++;
      let ti2 = this.findblockend(script, ti);
      if (ti2 >= 0) {
        let content = script.substring(ti, ti2);
        blocks.push({title: title.trim(), content: content, pos: ti});
        i = ti2 + 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return blocks;
};

GekijouScript.prototype.parse = function (script) {
  this.script = script.trim();
  if (script) {
    var blocks = this.splitblock();
    for (let i = 0; i < blocks.length; i++) {
      let b = blocks[i];
      switch (b.title) {
        case 'setup':
          this.parseSetup(b.content, b.pos);
          break;
        case 'chara':
          this.parseChara(b.content, b.pos);
          break;
        case 'event':
          this.parseEvent(b.content, b.pos);
          break;
      }
    }
    return true;
  }
  return false;
};

GekijouScript.prototype.parseSetup = function (subscript, start) {
  var lines = this.splitline(subscript);
  var setup = {};
  for (let i = 0; i < lines.length; i++) {
    var lineprops = this.splitprop(lines[i]);
    setup[lineprops[0]] = lineprops.slice(1);
  }
  this.setup = setup;
};

GekijouScript.prototype.parseChara = function (subscript, start) {
  var blocks = this.splitblock(subscript);
  var charas = [];
  var failed = false;

  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    let props = this.splitprop(b.title);
    let lines = this.splitline(b.content);

    if (props.length >= 2 && props[0] === 'define' && lines.length > 0) {
      try {
        let cid = parseInt(props[1]);
        let c = {
          id: cid,
          username: JSON.parse(props[2]),
        };

        for (let j = 0; j < lines.length; j++) {
          var lineprops = this.splitprop(lines[j]);
          switch (lineprops[0]) {
            case 'icon':
              if (lineprops.length >= 3) {
                c.iconid = parseInt(lineprops[1]);
                c.iconurl = JSON.parse(lineprops[2]);
                if (lineprops[3]) c.iconcolor = JSON.parse(lineprops[3]);
              }
              break;
            case 'showon':
              if (lineprops.length >= 2) {
                c.showon = lineprops[1] === 'right' ? 'right' : 'left';
              }
              break;
            case 'subtitle':
              if (lineprops.length >= 2 && lineprops[1]) {
                c.subtitle = JSON.parse(lineprops[1]);
              }
          }
        }
        charas.push(c);
      } catch (e) {
        failed = true;
        break;
      }
    } else {
      failed = true;
      break;
    }
  }

  if (failed) {
    throw new GekijouSyntaxError('failed to parse chara block.', start, this.script);
  }

  this.chara = charas;
};

GekijouScript.prototype.parseEvent = function (subscript, start) {
  var _timecount = 0;
  var blocks = this.splitblock(subscript);
  var events = [];
  var failed = false;

  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    let props = this.splitprop(b.title);

    if (props.length >= 4 && props[0] === 'define') {
      let ev = {
        id: parseInt(props[1]),
        time: parseInt(props[3]),
      };
      if (ev.id === NaN || ev.time === NaN) {
        failed = true;
        break;
      }
      try {
        ev.name = JSON.parse(props[2]);
      } catch (e) {
        failed = true;
        break;
      }
      ev.actions = this.parseAction(b.content);
      _timecount += ev.time;
      events.push(ev);
    } else {
      failed = true;
      break;
    }
  }

  if (failed) {
    throw new GekijouSyntaxError('failed to parse event block.', start, this.script);
  }

  this.duration = _timecount;
  this.event = events;
};

GekijouScript.prototype.parseAction = function (subscript) {
  var lines = this.splitline(subscript);
  var actions = [];
  for (let i = 0; i < lines.length; i++) {
    var lineprops = this.splitprop(lines[i]);
    actions.push(lineprops);
  }
  return actions;
};

GekijouScript.prototype.get_chara_iconids = function () {
  var chara_iconids = [];
  if (this.chara) {
    for (let i = 0; i < this.chara.length; i++) {
      let c = this.chara[i];
      if (c.iconid) {
        chara_iconids.push(c.iconid);
      }
    }
  }
  return chara_iconids;
};

module.exports = GekijouScript;
