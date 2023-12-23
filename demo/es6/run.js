const md = require('markdown-it');
const namedCodeBlocks = require('../../dist');

const parser = md().use(namedCodeBlocks);

const str = '```js:hello.js\nconsole.log("Hello World!);```'

const result = parser.render(str);
console.log(result)