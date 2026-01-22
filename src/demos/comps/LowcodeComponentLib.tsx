import { html } from "../../libs/LowcodeViewKit";

// 定义组件
export function HelloComponent(props) {
  return html`<h1>Hello ${props.name}!</h1>`;
}
