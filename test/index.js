"use strict";

const path = require("path");
const generate = require("markdown-it-testgen");
const hljs = require("highlight.js");

describe("markdown-it-named-code-blocks", () => {
  let md = require("markdown-it")().use(require("../src"));

  generate(
    path.join(__dirname, "./fixture/codeblock.txt"),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-default-highlight", () => {
  let md = require("markdown-it")({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, str).value;
      }
      return ""; // use external default escaping
    },
  }).use(require("../src"));

  generate(
    path.join(__dirname, "./fixture/codeblock_highlightjs.txt"),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-override-highlight", () => {
  let md = require("markdown-it")({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          "</code></pre>"
        );
      }

      return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
      );
    },
  }).use(require("../src"));

  generate(
    path.join(__dirname, "./fixture/codeblock_highlightjs_full_override.txt"),
    { header: true },
    md
  );
});

describe("markdown-it-named-code-blocks-inline-css", () => {
  let md = require("markdown-it")().use(require("../src"), {
    isEnableInlineCss: true,
  });

  generate(
    path.join(__dirname, "./fixture/codeblock_inline_css.txt"),
    { header: true },
    md
  );
});
