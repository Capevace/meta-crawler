const { crawl } = require('./src');

async function start() {
  const meta = await crawl('http://smoolabs.com/', {
    blacklist: ['wp-content', 'wp-uploads', 'wp-admin'],
    required: ['smoolabs.com'],
    writeFile: true
  });

  console.log(meta);
}

start();
