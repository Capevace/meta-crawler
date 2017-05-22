<h1 align="center">meta-crawler</h1>
<h4 align="center">
  A small web crawler that collects a given site's meta-tag data.
</h4>
<p align="center">
  <img alt="license" src="https://img.shields.io/npm/l/meta-crawler.svg">
  <img alt="version" src="https://img.shields.io/npm/v/meta-crawler.svg">
  <img alt="npm downloads" src="https://img.shields.io/npm/dt/meta-crawler.svg">
</p>

## Installation
```sh
npm install --save meta-crawler
# or using yarn
yarn add meta-crawler
```

## Usage
```js
const { crawl, MetaCrawler } = require('meta-crawler');

// You can either use the 'crawl' utility function
const meta = crawl('http://...');

// or using the class
const crawler = new MetaCrawler('http://...');
const meta = await crawler.start();
```

## Options
### crawl(url: String, options: Object) -> Promise
This is the utility function to make crawling easier.
Returns a promise which eventually resolves to the metadata.

### new MetaCrawler(url: String, options: Object) -> MetaCrawler
This is the class the utility function encapsulates.

#### crawler.start() -> Promise
This method starts the crawling of the MetaCrawler instance.
Returns a promise which eventually resolves to the metadata.

### Default `options`:
```js
{
  // The names of meta-tags to collect
  metaTypes: ['description', 'keywords'],

  // Limit is the maximum number of pages to index. Ignored if set to -1
  limit: -1,

  // The filepath for the json file to be saved to.
  filepath: path.resolve(process.cwd()),

  // List of blacklisted phrases that are not allowed to be in the discovered urls
  blacklist: [],

  // List of required phrases that have to be in the discovered urls
  required: [],

  // Wether to automatically write a file at the end of the crawl
  writeFile: false
}
```


## License
Copyright 2017 Lukas von Mateffy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
