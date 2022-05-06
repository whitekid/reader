// usage:
//    cat fixtures/ciokorea.html | node readability.js https://www.ciokorea.com/news/234834
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom');

var fs = require("fs");
var stdinBuffer = fs.readFileSync(0); // STDIN_FILENO = 0

var doc = new JSDOM(stdinBuffer.toString(), {
  url: process.argv[2],
});

let reader = new Readability(doc.window.document);
let article = reader.parse();

//
// title
// byline
// dir
// lang
// content
// textContent
// length
// siteName
console.log(JSON.stringify(article))