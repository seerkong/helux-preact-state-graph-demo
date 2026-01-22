import {
  $,
  share,
  sharex,
  atom,
  atomx,
  derive,
  deriveDict,
  block,
} from "../libs/helux";
// import {html} from 'lit';
import { h, Component, render } from "preact";
import htm from "htm";
import { random, delay } from "../logic/util";

// 为 Preact 初始化 htm
export const html = htm.bind(h);

// 动态生成模板字面量
export function viewRender(template, components, viewModel, intents, styles) {
  // 创建一个函数来渲染 HTML
  const mergedObject = Object.assign(
    {},
    components,
    viewModel,
    intents,
    styles
  );
  const renderTemplate = new Function(
    "html",
    "mergedObject",
    `
    const { ${Object.keys(mergedObject).join(",")} } = mergedObject;
    return html\`${template}\`;
  `
  );
  return renderTemplate(html, mergedObject);
}
