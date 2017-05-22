'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
      writeFile: false
    }, options);
    this.meta = {};
    this.errors = [];
    this.newUrls = [rootUrl];
  }

  _createClass(MetaCrawler, [{
    key: 'start',
    value: async function start() {
      var limitCounter = this.options.limit;
      do {
        await this.crawlPage(this.newUrls.pop());
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
        console.log('Requesting ' + url);
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
          try {
            return normalizeUrl(link.attribs.href);
          } catch (e) {
            console.log('Found invalid link ' + link.attribs.href);
            return '';
          }
        }).filter(function (link) {
          return !_this.meta[link] && link !== '' && !_this.newUrls.includes(link) && !_this.linkIncludesBlacklisted(link) && _this.linkIncludesRequired(link);
        });

        this.newUrls = this.newUrls.concat(links);
        console.log('Found ' + links.length + ' new links.');
        console.log(this.newUrls.length + ' links left to crawl.');
        console.log('Finished ' + url);
      } catch (e) {
        console.log('Error occurred', e);
        this.errors.push(errors);
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