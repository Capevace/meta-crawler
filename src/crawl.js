const MetaCrawler = require('./MetaCrawler');

module.exports = async function crawl(url, options) {
  const crawler = new MetaCrawler(url, options);
  return await crawler.start();
};
