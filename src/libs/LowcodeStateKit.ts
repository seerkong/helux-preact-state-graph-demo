import {
  $,
  share,
  sharex,
  atom,
  atomx,
  derive,
  deriveDict,
  useDerived,
  block,
} from "../libs/helux";
import { DataFlag, DataNode, ReactiveDataFlow } from "./ReactiveDataFlow";

export function atomSignal(initVal, flags: DataFlag = {}): DataNode {
  const ctx_origin = atomx(initVal);
  const ctx_wrapper = {
    get: () => ctx_origin.stateRoot.val,
    set: ctx_origin.setState,
    flags: flags,
  };
  return ctx_wrapper;
}

export function dictSignal(initVal, flags: DataFlag = {}): DataNode {
  const { reactive: reactiveObj } = sharex(initVal);
  const derived_wrapper = {
    get: () => reactiveObj,
    flags: flags,
  };
  return derived_wrapper;
}

export function syncCompute(fn, flags: DataFlag = {}): DataNode {
  const derived_origin = derive(fn);
  flags.computed = true;
  const derived_wrapper = {
    get: () => derived_origin.val,
    flags: flags,
  };
  return derived_wrapper;
}

// initValFn 例子 () => 0
// taskParamFn 例子 () => [numAtom.val]。 返回要执行taskFn是的参数
// task的例子 async ({ input }) => {
//   await delay();
//   return input[0] + 100;
// }
export function asyncCompute(
  initValFn,
  taskParamFn,
  taskFn,
  flags: DataFlag = {}
): DataNode {
  const derived_origin = derive({
    fn: initValFn,
    deps: taskParamFn,
    task: async ({ input }) => {
      let r = await taskFn(...input);
      console.log("async compute, input", input);
      return r;
    },
  });
  // const [result, status] = useDerived(derived_origin);
  // const derived_wrapper = {
  //   status: () => status,
  //   get: () => result
  // };
  flags.computed = true;
  const derived_wrapper = {
    get: () => derived_origin.val,
    flags: flags,
  };
  return derived_wrapper;
}

export function makeReactiveDataFlow(dsl): ReactiveDataFlow {
  let rdf = new ReactiveDataFlow();

  for (let dataNodeDsl of dsl.dataNodes) {
    if (dataNodeDsl.type == "atomSignal") {
      let dataNode = makeAtomSignalFromDsl(rdf, dataNodeDsl);
      rdf.addDataNode(dataNodeDsl.name, dataNode);
    } else if (dataNodeDsl.type == "dictSignal") {
      let dataNode = makeDictSignalFromDsl(rdf, dataNodeDsl);
      rdf.addDataNode(dataNodeDsl.name, dataNode);
    } else if (dataNodeDsl.type == "syncCompute") {
      let dataNode = makeSyncComputeFromDsl(rdf, dataNodeDsl);
      rdf.addDataNode(dataNodeDsl.name, dataNode);
    } else if (dataNodeDsl.type == "asyncCompute") {
      let dataNode = makeAsyncComputeFromDsl(rdf, dataNodeDsl);
      rdf.addDataNode(dataNodeDsl.name, dataNode);
    }
  }

  return rdf;
}

function makeAtomSignalFromDsl(rdf, dataNodeDsl) {
  return atomSignal(dataNodeDsl.initVal, dataNodeDsl.flags);
}

function makeDictSignalFromDsl(rdf, dataNodeDsl) {
  return dictSignal(dataNodeDsl.initVal, dataNodeDsl.flags);
}

function makeSyncComputeFromDsl(rdf, dataNodeDsl) {
  let fn = () => {
    return dataNodeDsl.processFn(rdf);
  };
  return syncCompute(fn, dataNodeDsl.flags);
}

function makeAsyncComputeFromDsl(rdf, dataNodeDsl) {
  return asyncCompute(
    dataNodeDsl.initValFn,
    () => {
      return dataNodeDsl.taskParamFn(rdf);
    },
    dataNodeDsl.processFn,
    dataNodeDsl.flags
  );
}
