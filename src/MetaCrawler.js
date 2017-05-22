const request = require('request-promise-native');
const cheerio = require('cheerio');
const normalizeUrl = require('normalize-url');
const fs = require('mz/fs');
const path = require('path');

class MetaCrawler {
  constructor(rootUrl, options = {}) {
    this.rootUrl = rootUrl;
    this.options = Object.assign(
      {},
      {
        metaTypes: ['description', 'keywords'],
        limit: -1,
        filepath: path.resolve(process.cwd()),
        blacklist: [],
        required: [],
        writeFile: false
      },
      options
    );
    this.meta = {};
    this.errors = [];
    this.newUrls = [rootUrl];
  }

  async start() {
    let limitCounter = this.options.limit;
    do {
      await this.crawlPage(this.newUrls.pop());
    } while (
      this.newUrls.length > 0 &&
      (this.options.limit === -1 || --limitCounter > 0)
    );

    const filename = 'crawl-' + new Date().toISOString() + '.json';

    if (this.options.writeFile)
      await fs.writeFile(
        path.resolve(this.options.filepath, filename),
        JSON.stringify(this.meta, null, 2)
      );

    return this.meta;
  }

  async crawlPage(url) {
    try {
      console.log(`Requesting ${url}`);
      const result = await request(url);
      const $ = cheerio.load(result);
      const metaForUrl = {};

      $('meta')
        .toArray()
        .filter(meta => this.options.metaTypes.includes(meta.attribs.name))
        .forEach(meta => {
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
      const links = $('a[href]:not([href="#"])')
        .toArray()
        .map(link => {
          try {
            return normalizeUrl(link.attribs.href);
          } catch (e) {
            console.log(`Found invalid link ${link.attribs.href}`);
            return '';
          }
        })
        .filter(
          link =>
            !this.meta[link] &&
            link !== '' &&
            !this.newUrls.includes(link) &&
            !this.linkIncludesBlacklisted(link) &&
            this.linkIncludesRequired(link)
        );

      this.newUrls = this.newUrls.concat(links);
      console.log(`Found ${links.length} new links.`);
      console.log(`${this.newUrls.length} links left to crawl.`);
      console.log(`Finished ${url}`);
    } catch (e) {
      console.log('Error occurred', e);
      this.errors.push(errors);
    }
  }

  linkIncludesBlacklisted(link) {
    return this.options.blacklist.reduce((includesBlacklisted, phrase) => {
      if (includesBlacklisted) return true;

      return link.includes(phrase);
    }, false);
  }

  linkIncludesRequired(link) {
    return this.options.required.reduce((missingRequired, phrase) => {
      if (missingRequired) return true;

      return !link.includes(phrase);
    }, false);
  }
}

// const crawler = new MetaCrawler('http://gesunde-matratzen.de', {
//   blacklist: ['wp-content', 'wp-uploads', 'wp-admin']
// });
// // (async () => await crawler.start())();

module.exports = MetaCrawler;
