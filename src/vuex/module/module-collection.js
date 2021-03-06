import { forEachValue } from "../utils";
import Module from "./module";

/**
 * 模块收集操作
 *  处理用户传入的 options 选项
 *  将子模块注册到对应的父模块上
 */
class ModuleCollection {
  constructor(options) {
    // 从根模块开始，将子模块注册到父模块中
    // 参数1数组:栈结构，用于存储路径，标识模块树的层级关系
    this.register([], options);
  }
  /**
   * 根据当前模块的 path 路径，拼接当前模块的命名空间标识
   * @param {*} path 
   * @returns 
   */
  getNamespaced(path) {
    let root = this.root;
    // 从根模块开始，逐层处理子模块，拼接命名空间标识
    return path.reduce((str, key) => {
      // 从根模块查找当前子模块
      root = root.getChild(key);
      // 若子模块启用命名空间，拼接命名空间标识并返回结果继续处理
      return str + (root.namespaced ? key + '/' : '')
    }, '');
  }
  /**
   * 将子模块注册到父模块中
   * @param {*} path       数组类型,当前待注册模块的完整路径
   * @param {*} rootModule 当前待注册模块对象
   */
  register(path, rootModule) {
    // 格式化:构建 Module 对象
    // 通过类的方式产生实例，便于后续的扩展
    let newModule = new Module(rootModule);
    // let newModule = {
    //   _raw: rootModule,        // 当前模块的完整对象
    //   _children: {},           // 当前模块的子模块
    //   state: rootModule.state  // 当前模块的状态
    // } 

    // 根模块时:创建模块树的根对象
    if (path.length == 0) {
      this.root = newModule;
      // 非根模块时:将当前模块,注册到对应父模块上
    } else {
      // 逐层找到当前模块的父亲（例如:path = [a,b,c,d]）
      let parent = path.slice(0, -1).reduce((memo, current) => {
        //从根模块中找到a模块;从a模块中找到b模块;从b模块中找到c模块;结束返回c模块即为d模块的父亲
        return memo.getChild(current);
        // return memo._children[current];
      }, this.root)
      // 将d模块注册到c模块上
      // parent._children[path[path.length - 1]] = newModule
      parent.addChild(path[path.length - 1], newModule);
    }

    // 若当前模块存在子模块,继续注册子模块
    if (rootModule.modules) {
      // 采用深度递归方式处理子模块
      forEachValue(rootModule.modules, (module, moduleName) => {
        // 将子模块注册到对应的父模块上
        // 1,path:待注册子模块的完整路径,当前父模块path拼接子模块名moduleName
        // 2,module:当前待注册子模块对象
        this.register(path.concat(moduleName), module)
      })
      // Object.keys(rootModule.modules).forEach(moduleName => {
      //   let module = rootModule.modules[moduleName];
      //   this.register(path.concat(moduleName), module)
      // });
    }
  }
}

export default ModuleCollection;