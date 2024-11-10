"use strict";

import { parse, HTMLElement } from "node-html-parser";
import { Token, Options, PluginWithOptions } from "markdown-it";
import Renderer from "markdown-it/lib/renderer.mjs";

type ParsedFenceInfo = {
  langName: string;
  fileName: string;
  langAttrs: string;
};

type CssOptions = {
  isEnableInlineCss: boolean;
};

type Env = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const fencBlockName = "named-fence-block";
const fenceFileName = "named-fence-filename";
const defaultStyleOptions = {
  mincbBlock: "position: relative; padding-top: 2em;",
  mincbName:
    "position: absolute; top: 0; left: 0; padding: 0 4px; " +
    "font-weight: bold; color: #000000; background: #c0c0c0; opacity: .6;"
};

const namedCodeBlocks: PluginWithOptions<CssOptions> = (md, options) => {
  const isEnableInlineCss = options?.isEnableInlineCss ?? false;

  const defaultRender = md.renderer.rules?.fence;
  if (!defaultRender) {
    throw new Error("defaultRender is undefined");
  }

  md.renderer.rules.fence = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: Env,
    self: Renderer
  ) => {
    const token = tokens[idx];
    const orgInfo = token.info;
    const info = token.info ? String(token.info).trim() : "";
    let parsedFenceInfo: ParsedFenceInfo;

    if (info) {
      parsedFenceInfo = parseInfo(info);
      updateTokenInfo(token, parsedFenceInfo);
    } else {
      parsedFenceInfo = { langName: "", fileName: "", langAttrs: "" };
    }

    const rootElement = parse(defaultRender(tokens, idx, options, env, self));
    token.info = orgInfo;

    updateElement(rootElement, parsedFenceInfo, isEnableInlineCss);

    return rootElement.toString();
  };
};

function updateElement(
  element: HTMLElement,
  parsedFenceInfo: ParsedFenceInfo,
  isEnableInlineCss: boolean
): void {
  if (parsedFenceInfo.fileName && parsedFenceInfo.langName) {
    addNamedFenceBlockAttr(element, isEnableInlineCss);

    addNamedFenceFilenameAtrr(
      element,
      parsedFenceInfo.fileName,
      isEnableInlineCss
    );
  }
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

// export default namedCodeBlocks;
export = namedCodeBlocks;
