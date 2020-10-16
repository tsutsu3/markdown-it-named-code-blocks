"use strict";

const nhp = require("node-html-parser");

const fencBlockName = "named-fence-block";
const fenceFileName = "named-fence-filename";
const defaultStyleOptions = {
  mincbBlock: "position: relative; padding-top: 2em;",
  mincbName:
    "position: absolute; top: 0; left: 0; padding: 0 4px; " +
    "font-weight: bold; color: #000000; background: #c0c0c0; opacity: .6;",
};

module.exports = (md, options) => {
  let isEnableInlineCss = false;

  if (options) {
    isEnableInlineCss = options.isEnableInlineCss;
  }

  const defaultRender = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    let token = tokens[idx];
    const orgInfo = token.info;
    let info = token.info ? String(token.info).trim() : "";
    let parsedInfoData;

    if (info) {
      parsedInfoData = parseInfo(info);

      updateTokenInfo(token, parsedInfoData);
    } else {
      parsedInfoData = { langName: "", fileName: "", langAttrs: "" };
    }

    let rootElement = nhp.parse(defaultRender(tokens, idx, options, env, self));

    token.info = orgInfo;

    updateElement(rootElement, parsedInfoData, isEnableInlineCss);

    return rootElement.toString();
  };
};

function updateElement(element, parsedInfoData, isEnableInlineCss) {
  if (parsedInfoData.fileName && parsedInfoData.langName) {
    addNamedFenceBlockAttr(element, isEnableInlineCss);

    addNamedFenceFilenameAtrr(
      element,
      parsedInfoData.fileName,
      isEnableInlineCss
    );
  }
}

function addNamedFenceBlockAttr(element, isEnableInlineCss) {
  const existClass = element.firstChild.getAttribute("class");

  if (element.firstChild.getAttribute("class")) {
    element.firstChild.setAttribute("class", `${existClass} ${fencBlockName}`);
  } else {
    element.firstChild.setAttribute("class", fencBlockName);
  }

  if (isEnableInlineCss) {
    element.firstChild.setAttribute("style", defaultStyleOptions.mincbBlock);
  }
}

function addNamedFenceFilenameAtrr(element, fileName, isEnableInlineCss) {
  let node = nhp.parse(`<div class="${fenceFileName}">${fileName}</div>`);

  if (isEnableInlineCss) {
    node.firstChild.setAttribute("style", defaultStyleOptions.mincbName);
  }

  element.firstChild.appendChild(node);
}

function parseInfo(info) {
  // https://regex101.com/r/PacPRb/4
  let data = { langName: "", fileName: "", langAttrs: "" };
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

function updateTokenInfo(token, parsedInfoData) {
  if (parsedInfoData.langName) {
    token.info = parsedInfoData.langName + " " + parsedInfoData.angAttrs;
  } else {
    token.info = "";
  }
}
