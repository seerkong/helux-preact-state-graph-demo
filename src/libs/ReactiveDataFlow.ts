export interface DataFlag {
  // 可以通过命令进行写入的，source of truth
  in?: boolean;
  // 可以在view中使用的
  out?: boolean;
  // 加工产生
  computed?: boolean;
  // 为了实现输入前的约束，定义的数据
  restriction?: boolean;
  // 为了实现输入后的校验，定义的数据
  validation?: boolean;
}

export interface DataNode {
  get: () => any;
  set?: (any) => any;
  flags: DataFlag;
}

export class ReactiveDataFlow {
  dataNodes: Map<string, DataNode> = new Map();

  addDataNode(name, node) {
    this.dataNodes.set(name, node);
  }

  get(dataNodeKey) {
    return this.dataNodes.get(dataNodeKey);
  }

  getViewModel() {
    let viewModel = {};
    for (let entry of this.dataNodes) {
      let key = entry[0];
      let dataNodes = entry[1];
      if (dataNodes.flags.out === true) {
        viewModel[key] = dataNodes;
      }
    }
    return viewModel;
  }
}
