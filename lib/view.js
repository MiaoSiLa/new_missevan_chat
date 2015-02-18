
exports.pagination = function (page, pagecount, url) {
  if (page && pagecount) {
    var pagination = {
      first: {},
      previous: {},
      page: [],
      next: {},
      last: {}
    };
    if (page === 1) {
      pagination.first.display = false;
      pagination.previous.display = false;
    } else {
      pagination.first.display = true;
      pagination.previous.display = true;
      pagination.first.page = 1;
      pagination.previous.page = page - 1;
    }
    if (page >= pagecount) {
      pagination.next.display = false;
      pagination.last.display = false;
    } else {
      pagination.next.display = true;
      pagination.last.display = true;
      pagination.next.page = page + 1;
      pagination.previous.page = pagecount;
    }

    if (pagecount <= 5) {
      for (var i = 0; i < pagecount; i++) {
        var pa = {
          display: true,
          page: i + 1
        };
        if (i + 1 === page) {
          pa.selected = true;
        }

        pagination.page.push(pa);
      }
    } else {
      var pagenum = [];
      if (page < 3) {
        pagenum = [1, 2, 3, 4, 5];
      } else if (pagecount - 2 <= page && page <= pagecount) {
        for (var _j = pagecount - 4; _j <= pagecount; _j++) {
          pagenum.push(_j);
        }
      } else {
        for (var _k = page - 2; _k <= page + 2; _k++) {
          pagenum.push(_k);
        }
      }
      for (var i = 0; i < pagenum.length; i++) {
        var pa = {
          display: true,
          page: pagenum[i]
        };
        if (pagenum[i] === page) {
          pa.selected = true;
        }
        pagination.page.push(pa);
      }
    }

    if (url.indexOf('?') >= 0) {
      url += '&p=';
    } else {
      url += '?p=';
    }
    for (var k in pagination) {
      var p = pagination[k];
      if (k === 'page') {
        for (var i = 0; i < p.length; i++) {
          if (p[i].display) {
            p[i].url = url + p[i].page;
          }
        }
      } else if (p.display) {
        p.url = url + p[i].page;
      }
    }
    return pagination;
  }
  return null;
};
