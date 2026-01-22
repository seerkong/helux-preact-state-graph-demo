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
import { h, Component, render } from "preact";
import htm from "htm";
import { random, delay } from "./logic/util";
import { html, viewRender } from "../libs/LowcodeViewKit";
import { ReactiveDataFlow } from "../libs/ReactiveDataFlow";
import {
  atomSignal,
  dictSignal,
  syncCompute,
  asyncCompute,
  makeReactiveDataFlow,
} from "../libs/LowcodeStateKit";
import { HelloComponent } from "./comps/LowcodeComponentLib";
import { makeIntentHandlerDefinition } from "../libs/LowcodeIntentKit";

//// data model flow
// 一个组件最小功能的计算过程是主干
// 可以追加其他的计算过程，进行补充
// 比如【约束】是输入前，【校验】是输入后
//
// 在基于数据计算图的架构下，如果要实现约束、校验，需要在这个图的主干节点之外，
// 在不修改主干的前提下，添加新的节点，用于约束的状态对象，和校验的约束对象
// 举个例子，可以要校验一个input，可以再添加一个inputValidateResult的 计算状态，然后显示到输入框下方
//
// 【约束】的场景例子有：
// 下拉选项、输入联想补全、字段A输入后限制字段B的值只能在一个范围内进行选择(如日期)，
// 某个字段选择后其他字段变为不可编辑、翻页时限制第一页和最后一页的按钮灰化、等等
//
// 要实现输入前的【约束】的需求，也是类似，需要将需求转换为新增的状态节点和计算过程
let reactiveDataFlowDsl = {
  dataNodes: [
    {
      type: "dictSignal",
      name: "helloVM",
      flags: { in: true, out: true },
      initVal: { value: "", name: "world" },
    },
    {
      type: "atomSignal",
      name: "counter",
      flags: { in: true, out: true },
      initVal: 1,
    },
    {
      type: "syncCompute",
      name: "plus100",
      flags: {},
      dependsOn: ["counter"],
      processFn: (rdf) => rdf.get("counter").get() + 100,
    },
    {
      type: "syncCompute",
      name: "plus300",
      flags: { out: true },
      dependsOn: ["plus100"],
      processFn: (rdf) => rdf.get("plus100").get() + 200,
    },
    {
      type: "asyncCompute",
      name: "asyncPlus100",
      flags: { out: true },
      dependsOn: ["counter"],
      initValFn: () => 0,
      taskParamFn: (rdf) => [rdf.get("counter").get(), 525],
      processFn: async (arg1, arg2) => {
        await delay();
        console.log("async task handler, arg1 ", arg1, " arg2 ", arg2);
        return arg1 + 100;
      },
    },
  ],
};

let reactiveDataFlow = makeReactiveDataFlow(reactiveDataFlowDsl);

//// intents
// inIntents 是给组件进行输入的动作，比如按钮触发、ws事件、localstorage change
// outIntents 是组件向外发出的消息，比如可以向上层级透传的事件，调用上层组件的函数等等
let intentDefDsl = {
  inIntents: [
    {
      type: "Click",
      name: "increase",
      processFn: (rdf) => {
        rdf.get("plus100").get() + 200;
        console.log("before set counter: ", rdf.get("counter").get());
        rdf.get("counter").set((v) => v + 1);
        console.log("after set ctx: ", rdf.get("counter").get());
      },
    },
    {
      type: "TextInput",
      name: "onInput",
      processFn: (rdf, ev) => {
        console.log("onInput, ", ev.currentTarget.value);
        rdf.get("helloVM").get().value = ev.currentTarget.value;
      },
    },
    {
      type: "FormSubmit",
      name: "onSubmit",
      processFn: (rdf, ev) => {
        // Prevent default browser behavior (aka don't submit the form here)
        ev.preventDefault();
        rdf.get("helloVM").get().name = rdf.get("helloVM").get().value;
      },
    },
  ],
};

let intentHandlerDef = makeIntentHandlerDefinition(
  reactiveDataFlow,
  intentDefDsl
);

//// view
// 定义动态模板字符串
// 动态组件必须使用 ${HelloComponent} 作为标签，不能直接<HelloComponent />
// 由于view模板只是绑定view model和intents，且只是一个字符串，便于将视图设计器和逻辑设计器分离
// 因此当逻辑不变，只自定义视图时，可以更换为其他的view dsl
// 另外由于view的渲染数据来源，限制为通过view model, 因此可以在没有model和intent的实现之前，
// 做view model的mock, 独立进行测试
let viewDSL =
  "<${HelloComponent} name='World' />\n" +
  "<div>\n" +
  "<h3>counter: ${counter.get()}</h3>\n" +
  "<h3>plus300 : ${plus300.get()}</h3>\n" +
  "<h3>asyncPlus100 : ${JSON.stringify(asyncPlus100.get())}</h3>\n" +
  "<button onClick=${increase}>increase</button>\n" +
  "\n" +
  "<h3>state.name: ${helloVM.get().name}</h3>\n" +
  "<h3>state.value: ${helloVM.get().value}</h3>\n" +
  "\n" +
  "<form onSubmit=${onSubmit}>\n" +
  "  <input type='text' value=${helloVM.get().value} onInput=${onInput} />\n" +
  "  <button type='submit'>Update</button>\n" +
  "</form>\n" +
  "</div>";

export const DeclarativeGUITest = block((props, params) => {
  let components = { HelloComponent };
  let viewModel = reactiveDataFlow.getViewModel();

  let intents = intentHandlerDef.getIntents();
  // TODO 按照当前设计工程化的思路，样式也应该是组件化的，一处修改，引用叠加的部分都产生变更
  let styles = {};
  return viewRender(viewDSL, components, viewModel, intents, styles);
});
