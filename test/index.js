const { crawl, MetaCrawler } = require('../lib');

async function start() {
  const meta = await crawl('http://smoolabs.com', {
    blacklist: ['wp-content', 'wp-uploads', 'wp-admin']
  });

  console.log(meta);
}

start();
