"use strict";

import path from "path";

const generate = require("markdown-it-testgen"); // eslint-disable-line @typescript-eslint/no-var-requires
import hljs from "highlight.js";
import MarkdownIt from "markdown-it";
import namedCodeBlocks from "../src";

const hljsVersion = require("highlight.js/package.json").version;
const fixturePath = hljsVersion.startsWith("10")
  ? "fixture/hljs10"
  : "fixture/hljs11";

console.log(`Running tests with highlight.js version: ${hljsVersion}`);

describe("markdown-it-named-code-blocks", () => {
  const md = new MarkdownIt().use(namedCodeBlocks);

  generate(
    path.join(__dirname, `./${fixturePath}/codeblock.txt`),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-default-highlight", () => {
  const md = new MarkdownIt({
    highlight: function (str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(str, { language: lang }).value;
      }
      return "";
    }
  }).use(namedCodeBlocks);

  generate(
    path.join(__dirname, `./${fixturePath}/codeblock_highlightjs.txt`),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-override-highlight", () => {
  const md: MarkdownIt = new MarkdownIt({
    highlight: function (str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      }

      return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
      );
    }
  }).use(namedCodeBlocks);

  generate(
    path.join(
      __dirname,
      `./${fixturePath}/codeblock_highlightjs_full_override.txt`
    ),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-inline-css", () => {
  const md = new MarkdownIt().use(namedCodeBlocks, {
    isEnableInlineCss: true
  });

  generate(
    path.join(__dirname, `./${fixturePath}/codeblock_inline_css.txt`),
    { header: true },
    md
  );
});
