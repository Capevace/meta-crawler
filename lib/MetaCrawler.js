'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request-promise-native');
var cheerio = require('cheerio');
var normalizeUrl = require('normalize-url');
var fs = require('mz/fs');
var path = require('path');

var MetaCrawler = function () {
  function MetaCrawler(rootUrl) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MetaCrawler);

    this.rootUrl = rootUrl;
    this.options = Object.assign({}, {
      metaTypes: ['description', 'keywords'],
      limit: -1,
      filepath: path.resolve(process.cwd()),
      blacklist: [],
      required: [],
      writeFile: false,
      log: true,
      logErrors: false,
      callback: function callback() {},
      errorCallback: function errorCallback() {}
    }, options);
    this.meta = {};
    this.errors = [];
    this.newUrls = [rootUrl];
    this.errorUrls = [];
  }

  _createClass(MetaCrawler, [{
    key: 'start',
    value: async function start() {
      var limitCounter = this.options.limit;
      do {
        var url = this.newUrls.pop();
        await this.crawlPage(url);
      } while (this.newUrls.length > 0 && (this.options.limit === -1 || --limitCounter > 0));

      var filename = 'crawl-' + new Date().toISOString() + '.json';

      if (this.options.writeFile) await fs.writeFile(path.resolve(this.options.filepath, filename), JSON.stringify(this.meta, null, 2));

      return this.meta;
    }
  }, {
    key: 'crawlPage',
    value: async function crawlPage(url) {
      var _this = this;

      try {
        if (this.options.log) console.log('Requesting ' + url);

        var result = await request(url);
        var $ = cheerio.load(result);
        var metaForUrl = {};

        $('meta').toArray().filter(function (meta) {
          return _this.options.metaTypes.includes(meta.attribs.name);
        }).forEach(function (meta) {
          if (metaForUrl[meta.attribs.name]) {
            if (Array.isArray(metaForUrl[meta.attribs.name])) {
              metaForUrl[meta.attribs.name].push(meta.attribs.content);
            } else {
              metaForUrl[meta.attribs.name] = [meta.attribs.content];
            }
          } else {
            metaForUrl[meta.attribs.name] = meta.attribs.content;
          }
        });

        metaForUrl['title'] = $('title').text();
        this.meta[url] = metaForUrl;

        // collect links
        var links = $('a[href]:not([href="#"])').toArray().map(function (link) {
          var url = link.attribs.href;
          if (url.indexOf('/') === 0) {
            url = _this.rootUrl + url;
          }

          try {
            return normalizeUrl(url);
          } catch (e) {
            if (_this.options.log) console.log('Found invalid link ' + url);
            return '';
          }
        }).filter(function (link) {
          return !_this.meta[link] && link !== '' && !_this.newUrls.includes(link) && !_this.linkIncludesBlacklisted(link) && link.indexOf(_this.rootUrl) === 0 && !_this.errorUrls.includes(link);
        }
        // this.linkIncludesRequired(link)
        ).reduce(function (links, link) {
          return !links.includes(link) ? [].concat(_toConsumableArray(links), [link]) : links;
        }, []);

        this.newUrls = this.newUrls.concat(links);

        this.options.callback({
          meta: this.meta,
          urls: this.newUrls,
          linksFound: links
        });

        if (this.options.log) {
          console.log('Found ' + links.length + ' new links.');
          console.log(this.newUrls.length + ' links left to crawl.');
          console.log('Finished ' + url);
        }
      } catch (e) {
        if (this.options.log) console.log('Error occurred on ' + url, this.options.logErrors ? e : null);

        this.errorUrls.push(url);

        this.options.errorCallback({
          error: e,
          url: url,
          errorUrls: this.errorUrls
        });
      }
    }
  }, {
    key: 'linkIncludesBlacklisted',
    value: function linkIncludesBlacklisted(link) {
      return this.options.blacklist.reduce(function (includesBlacklisted, phrase) {
        if (includesBlacklisted) return true;

        return link.includes(phrase);
      }, false);
    }
  }, {
    key: 'linkIncludesRequired',
    value: function linkIncludesRequired(link) {
      if (this.options.required.length === 0) return true;

      return this.options.required.reduce(function (missingRequired, phrase) {
        if (missingRequired) return true;

        return !link.includes(phrase);
      }, false);
    }
  }]);

  return MetaCrawler;
}();

// const crawler = new MetaCrawler('http://gesunde-matratzen.de', {
//   blacklist: ['wp-content', 'wp-uploads', 'wp-admin']
// });
// // (async () => await crawler.start())();

module.exports = MetaCrawler;