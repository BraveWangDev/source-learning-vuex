import applyMixin from "./mixin";
import ModuleCollection from "./module/module-collection";
// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

/**
 * 安装模块
 * @param {*} store       容器
 * @param {*} rootState   根状态
 * @param {*} path        所有路径
 * @param {*} module      格式化后的模块对象
 */
const installModule = (store, rootState, path, module) => {

  // 遍历当前模块中的 actions、mutations、getters 
  // 将它们分别定义到 store 中的 _actions、_mutations、_wrappedGetters;

  // 遍历 mutation
  module.forEachMutation((mutation, key) => {
    // 处理成为数组类型：每个 key 可能会存在多个需要被处理的函数
    store._mutations[key] = (store._mutations[key] || []);
    // 向 _mutations 对应 key 的数组中，放入对应的处理函数
    store._mutations[key].push((payload) => {
      // 执行 mutation，传入当前模块的 state 状态
      mutation.call(store, module.state, payload);
    })
  })
  // 遍历 action
  module.forEachAction((action, key) => {
    store._actions[key] = (store._actions[key] || []);
    store._actions[key].push((payload) => {
      action.call(store, store, payload);
    })
  })
  // 遍历 getter
  module.forEachGetter((getter, key) => {
    // 注意：getter 重名将会被覆盖
    store._wrappedGetters[key] = function () {
      // 执行对应的 getter 方法，传入当前模块的 state 状态，返回执行结果
      return getter(module.state);
    }
  })
  // 遍历当前模块的儿子
  module.forEachChild((child, key) => {
    // 递归安装/加载子模块
    installModule(store, rootState, path.concat(key), child);
  })

  // 至此，将模块树中所有的 actions、mutations、getters 都放到了 store 中的_actions、_mutations、_wrappedGetters
}

// 容器的初始化
export class Store {
  constructor(options) {
    const state = options.state;

    // 收集所有模块中的action、mutation、getter 放到 Store 上
    this._actions = {};
    this._mutations = {};
    this._wrappedGetters = {};

    // 1,模块收集：options 格式化 -> Vuex 模块树
    this._modules = new ModuleCollection(options);
    console.log("格式化后的模块树对象", this._modules)

    // 2,模块安装：
    installModule(this, state, [], this._modules.root);
    console.log("模块安装结果:_mutations", this._mutations)
    console.log("模块安装结果:_actions", this._actions)
    console.log("模块安装结果:_wrappedGetters", this._wrappedGetters)
  }

  /**
   * 通过 type 找到 store 实例的 mutations 对象中对应的方法，并执行
   *    用户可能会解构使用{ commit }, 也有可能在页面使用 $store.commit，
   *    所以，在实际执行时，this 是不确定的，{ commit } 写法 this 为空，
   *    使用箭头函数：确保 this 指向 store 实例；
   * @param {*} type mutation 方法名
   * @param {*} payload 载荷：值或对象
   */
  commit = (type, payload) => {
    // 执行 mutations 对象中对应的方法，并传入 payload 执行
    this.mutations[type](payload)
  }

  /**
   * 通过 type 找到 store 实例的 actions 对象中对应的方法，并执行
   *    用户可能会解构使用{ dispatch }, 也有可能在页面使用 $store.dispatch,
   *    所以，在实际执行时，this 是不确定的，{ dispatch } 写法 this 为空，
   *    使用箭头函数：确保 this 指向 store 实例；
   * @param {*} type action 方法名
   * @param {*} payload 载荷：值或对象
   */
  dispatch = (type, payload) => {
    // 执行 actions 对象中对应的方法，并传入 payload 执行
    this.actions[type](payload)
  }

  get state() { // 对外提供属性访问器：当访问state时，实际是访问 _vm._data.$$state
    return this._vm._data.$$state
  }
}

/**
 * 插件安装逻辑：当Vue.use(Vuex)时执行
 * @param {*} _Vue Vue 的构造函数
 */
export const install = (_Vue) => {
  Vue = _Vue;
  // 将根组件中注入store实例，混入到所有子组件上
  applyMixin(Vue);
}