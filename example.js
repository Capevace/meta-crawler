const { crawl } = require('./src');

async function start() {
  const meta = await crawl('http://gesunde-matratzen.de/', {
    blacklist: ['wp-content', 'wp-uploads', 'wp-admin'],
    required: ['gesunde-matratzen.de'],
    writeFile: true
  });

  console.log(meta);
}

start();
