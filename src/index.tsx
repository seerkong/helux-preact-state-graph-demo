import React, { render } from "preact/compat";
import App from "./App";

const rootElement = document.getElementById("root")!;

render(<App />, rootElement);
// 主要看 src/demos/DeclarativeGUITest.tsx 文件
// 目前使用helux作为状态管理和lazy计算图实现，不满足我架构思路的点：
// 1 计算状态只能返回一个，而不是通过一次计算，产生多个计算字段
// 2 异步计算过程中的状态，比如是否loading, 不能在创建计算状态过程时直接创建，必须useDerive，
//   而且helux限制了只能在组件内部上下文 useDerive
// 3 逻辑复用，当前helux的service注入方式的逻辑复用，限制了入参，不支持传入我架构中的runtime
// 4 逻辑复用，不支持我架构中的 processor
