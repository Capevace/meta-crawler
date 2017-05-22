'use strict';

var MetaCrawler = require('./MetaCrawler');

module.exports = async function crawl(url, options) {
  var crawler = new MetaCrawler(url, options);
  return await crawler.start();
};