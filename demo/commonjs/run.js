import MarkdownIt from "markdown-it";
import namedCodeBlocks from "../../dist/index.js";

const parser = new MarkdownIt().use(namedCodeBlocks);

const str = '```js:hello.js\nconsole.log("Hello World!);```';

const result = parser.render(str);
console.log(result);
