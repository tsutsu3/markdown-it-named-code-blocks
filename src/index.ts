import { parse, HTMLElement } from "node-html-parser";
import type { MarkdownIt, Token } from "markdown-it";

type ParsedFenceInfo = {
  langName: string;
  fileName: string;
  langAttrs: string;
};

type CssOptions = {
  isEnableInlineCss: boolean;
};

const fencBlockName = "named-fence-block";
const fenceFileName = "named-fence-filename";
const defaultStyleOptions = {
  mincbBlock: "position: relative; padding-top: 2em;",
  mincbName:
    "position: absolute; top: 0; left: 0; padding: 0 4px; " +
    "font-weight: bold; color: #000000; background: #c0c0c0; opacity: .6;"
};

const namedCodeBlocks = (md: MarkdownIt, options?: CssOptions): void => {
  const isEnableInlineCss = options?.isEnableInlineCss ?? false;

  const defaultRender = md.renderer.rules.fence;
  if (!defaultRender) {
    throw new Error("defaultRender is undefined");
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const orgInfo = token.info;
    const info = token.info.trim();
    let parsedFenceInfo: ParsedFenceInfo;

    if (info) {
      parsedFenceInfo = parseInfo(info);
      parsedFenceInfo.fileName = md.utils.escapeHtml(parsedFenceInfo.fileName);
      updateTokenInfo(token, parsedFenceInfo);
    } else {
      parsedFenceInfo = { langName: "", fileName: "", langAttrs: "" };
    }

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

    updateElement(rootElement, parsedFenceInfo, isEnableInlineCss);

    return rootElement.toString();
  };
};

function updateElement(
  element: HTMLElement,
  parsedFenceInfo: ParsedFenceInfo,
  isEnableInlineCss: boolean
): void {
  addNamedFenceBlockAttr(element, isEnableInlineCss);

  addNamedFenceFilenameAtrr(
    element,
    parsedFenceInfo.fileName,
    isEnableInlineCss
  );
}

function addNamedFenceBlockAttr(
  element: HTMLElement,
  isEnableInlineCss: boolean
): void {
  if (element.firstChild instanceof HTMLElement) {
    const existClass = element.firstChild.getAttribute("class");

    if (element.firstChild.getAttribute("class")) {
      element.firstChild.setAttribute(
        "class",
        `${existClass} ${fencBlockName}`
      );
    } else {
      element.firstChild.setAttribute("class", fencBlockName);
    }

    if (isEnableInlineCss) {
      element.firstChild.setAttribute("style", defaultStyleOptions.mincbBlock);
    }
  }
}

function addNamedFenceFilenameAtrr(
  element: HTMLElement,
  fileName: string,
  isEnableInlineCss: boolean
): void {
  // fileName must already be HTML-escaped by the caller.
  const node = parse(`<div class="${fenceFileName}">${fileName}</div>`);

  const firstChild = node.firstChild;

  if (firstChild instanceof HTMLElement && isEnableInlineCss) {
    firstChild.setAttribute("style", defaultStyleOptions.mincbName);
  }

  if (element.firstChild instanceof HTMLElement) {
    element.firstChild.appendChild(node);
  }
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

function updateTokenInfo(token: Token, parsedFenceInfo: ParsedFenceInfo): void {
  if (parsedFenceInfo.langName) {
    token.info = parsedFenceInfo.langName + " " + parsedFenceInfo.langAttrs;
  } else {
    token.info = "";
  }
}

export = namedCodeBlocks;
