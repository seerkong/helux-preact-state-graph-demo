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
export class IntentHandlerDefinition {
  inIntents: Map<string, any> = new Map();
  outIntents: Map<string, any> = new Map();
  getIntents() {
    let result = {};
    for (let entry of this.inIntents) {
      let key = entry[0];
      let intentHandler = entry[1];
      result[key] = intentHandler;
    }
    return result;
  }
}

export function makeIntentHandlerDefinition(
  rdf: ReactiveDataFlow,
  dsl
): IntentHandlerDefinition {
  let r: IntentHandlerDefinition = new IntentHandlerDefinition();
  for (let intentDsl of dsl.inIntents) {
    if (intentDsl.type == "Click") {
      let intentHandler = makeClickIntentHandler(rdf, intentDsl);
      r.inIntents.set(intentDsl.name, intentHandler);
    } else if (intentDsl.type == "TextInput") {
      let intentHandler = makeTextInputIntentHandler(rdf, intentDsl);
      r.inIntents.set(intentDsl.name, intentHandler);
    } else if (intentDsl.type == "FormSubmit") {
      let intentHandler = makeFormSubmitIntentHandler(rdf, intentDsl);
      r.inIntents.set(intentDsl.name, intentHandler);
    }
  }
  return r;
}

function makeClickIntentHandler(rdf, intentDsl) {
  return () => {
    intentDsl.processFn(rdf);
  };
}

function makeTextInputIntentHandler(rdf, intentDsl) {
  return (ev) => {
    intentDsl.processFn(rdf, ev);
  };
}

function makeFormSubmitIntentHandler(rdf, intentDsl) {
  return (ev) => {
    intentDsl.processFn(rdf, ev);
  };
}
