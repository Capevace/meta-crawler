const meta = require('./meta.json');
const fs = require('fs');
const path = require('path');

let page = '';

for (const url in meta) {
  const data = meta[url];
  page += '<p>\n';
  page += '\t<a href="' + url + '"><i>' + url + '</i></a><br>\n';
  page += '\t<b>' + data.title + '</b><br>\n';
  page += '\t<span>' + data.description + '</span><br>\n';
  page += '</p><br>\n\n';
}

fs.writeFileSync(path.resolve(__dirname, 'meta.html'), page);
