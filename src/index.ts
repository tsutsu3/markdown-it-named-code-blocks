import { parse, HTMLElement } from "node-html-parser";
import type { MarkdownIt } from "markdown-it";

type ParsedFenceInfo = {
  langName: string;
  fileName: string;
  langAttrs: string;
};

type CssOptions = {
  isEnableInlineCss: boolean;
};

const fenceBlockName = "named-fence-block";
const fenceFileName = "named-fence-filename";
const fenceBlockStyle = "position: relative; padding-top: 2em;";
const fenceFileNameStyle =
  "position: absolute; top: 0; left: 0; padding: 0 4px; " +
  "font-weight: bold; color: #000000; background: #c0c0c0; opacity: .6;";

const namedCodeBlocks = (md: MarkdownIt, options?: CssOptions): void => {
  const isEnableInlineCss = options?.isEnableInlineCss ?? false;

  const defaultRender = md.renderer.rules.fence;
  if (!defaultRender) {
    throw new Error("defaultRender is undefined");
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const orgInfo = token.info;
    const parsedFenceInfo = parseInfo(token.info.trim());
    parsedFenceInfo.fileName = md.utils.escapeHtml(parsedFenceInfo.fileName);

    token.info = parsedFenceInfo.langName
      ? `${parsedFenceInfo.langName} ${parsedFenceInfo.langAttrs}`
      : "";

    let rendered: string;
    try {
      rendered = defaultRender(tokens, idx, options, env, self);
    } finally {
      token.info = orgInfo;
    }

    // Only named blocks need DOM changes; return others as rendered.
    if (!parsedFenceInfo.fileName || !parsedFenceInfo.langName) {
      return rendered;
    }

    const rootElement = parse(rendered);
    const pre = rootElement.firstChild;

    if (pre instanceof HTMLElement) {
      addNamedFenceBlockAttr(pre, isEnableInlineCss);
      addNamedFenceFileName(pre, parsedFenceInfo.fileName, isEnableInlineCss);
    }

    return rootElement.toString();
  };
};

function addNamedFenceBlockAttr(
  pre: HTMLElement,
  isEnableInlineCss: boolean
): void {
  const existClass = pre.getAttribute("class");
  pre.setAttribute(
    "class",
    existClass ? `${existClass} ${fenceBlockName}` : fenceBlockName
  );

  if (isEnableInlineCss) {
    pre.setAttribute("style", fenceBlockStyle);
  }
}

function addNamedFenceFileName(
  pre: HTMLElement,
  fileName: string,
  isEnableInlineCss: boolean
): void {
  // fileName must already be HTML-escaped by the caller.
  const style = isEnableInlineCss ? ` style="${fenceFileNameStyle}"` : "";
  pre.appendChild(
    parse(`<div class="${fenceFileName}"${style}>${fileName}</div>`)
  );
}

function parseInfo(info: string): ParsedFenceInfo {
  // https://regex101.com/r/PacPRb/4
  const data = { langName: "", fileName: "", langAttrs: "" };
  const arr = info.split(/(\s+)/g);
  const match = arr[0].match(/^([^:\n]+)?(:([^:\n]*))?([^:\n]*)?$/);
  const langAttrs = arr.slice(2).join("");
  if (match) {
    data.langName = match[1] || "";
    data.fileName = match[3] || "";
    data.langAttrs = langAttrs;
    return data;
  }

  return data;
}

export = namedCodeBlocks;
