import applyMixin from "./mixin";
import { forEachValue } from './utils';
import ModuleCollection from "./module/module-collection";
// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

// 通过当前模块路径 path，从最新的根状态上，获取模块的最新状态
function getState(store, path){
  return path.reduce((newState,current)=>{
     return newState[current];
  }, store.state);  // replaceState 后的最新状态
}

/**
 * 安装模块
 * @param {*} store       容器
 * @param {*} rootState   根状态
 * @param {*} path        所有路径
 * @param {*} module      格式化后的模块对象
 */
const installModule = (store, rootState, path, module) => {

  // 根据当前模块的 path 路径，拼接当前模块的命名空间标识
  let namespace = store._modules.getNamespaced(path);
  console.log(namespace)

  // 处理子模块：将子模块上的状态，添加到对应父模块的状态中；
  if (path.length > 0) {
    // 从根状态开始逐层差找，找到当前子模块对应的父模块状态
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current]
    }, rootState)
    // 支持 Vuex 动态添加模块，将新增状态直接定义成为响应式数据；
    Vue.set(parent, path[path.length - 1], module.state);
  }

  // 遍历当前模块中的 actions、mutations、getters 
  // 将它们分别定义到 store 中的 _actions、_mutations、_wrappedGetters;

  // 遍历 mutation
  module.forEachMutation((mutation, key) => {
    // 处理成为数组类型：每个 key 可能会存在多个需要被处理的函数
    store._mutations[namespace + key] = (store._mutations[namespace + key] || []);
    // 向 _mutations 对应 key 的数组中，放入对应的处理函数
    store._mutations[namespace + key].push((payload) => {
      // 旧：执行 mutation，传入当前模块的 state 状态
      // mutation.call(store, module.state, payload);
      // 新：Vuex 持久化需要使用最新的状态，而 module.state是老状态
      // 需要通过当前路径 path，获取到当前最新的状态
      mutation.call(store, getState(store,path), payload);
      // 当 mutation 执行时，依次执行 store.subscribe 状态变更事件订阅的处理函数 fn
      store._subscribes.forEach(fn => {
        console.log("状态更新，依次执行订阅处理")
        // 旧逻辑:使用根状态 rootState
        // fn(mutation, rootState);
        // 新逻辑:使用新状态 store.state
        fn(mutation, store.state);
      })
    })
  })
  // 遍历 action
  module.forEachAction((action, key) => {
    store._actions[namespace + key] = (store._actions[namespace + key] || []);
    store._actions[namespace + key].push((payload) => {
      action.call(store, store, payload);
    })
  })
  // 遍历 getter
  module.forEachGetter((getter, key) => {
    // 注意：getter 重名将会被覆盖
    store._wrappedGetters[namespace + key] = function () {
      // 旧逻辑：执行对应的 getter 方法，传入当前模块的 state 状态，返回执行结果
      // return getter(module.state);
      // 新逻辑：使用最新的状态进行处理
      return getter(getState(store,path));
      
    }
  })
  // 遍历当前模块的儿子
  module.forEachChild((child, key) => {
    // 递归安装/加载子模块
    installModule(store, rootState, path.concat(key), child);
  })

  // 至此，将模块树中所有的 actions、mutations、getters 都放到了 store 中的_actions、_mutations、_wrappedGetters
}

/**
 * 重置 Store 容器对象的 vm 实例
 * @param {*} store store实例，包含 _wrappedGetters 即全部的 getter 方法；
 * @param {*} state 根状态，在状态安装完成后包含全部模块状态；
 */
function resetStoreVM(store, state) {
  const computed = {}; // 定义 computed 计算属性
  store.getters = {};  // 定义 store 容器实例中的 getters
  // 遍历 _wrappedGetters 构建 computed 对象并进行数据代理
  forEachValue(store._wrappedGetters, (fn, key) => {
    // 构建 computed 对象，后面借助 Vue 计算属性实现数据缓存
    computed[key] = () => {
      return fn();
    }
    // 数据代理：将 getter 的取值代理到 vm 实例上，到计算数据取值
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    });
  })
  // 使用 state 根状态 和 computed 创建 vm 实例，成为响应式数据
  store._vm = new Vue({
    // 借助 data 使根状态 state 成为响应式数据
    data: {
      $$state: state
    },
    // 借助 computed 计算属性实现数据缓存
    computed
  });
}

// 容器的初始化
export class Store {
  constructor(options) {
    const state = options.state;

    // 收集所有模块中的action、mutation、getter 放到 Store 上
    this._actions = {};
    this._mutations = {};
    this._wrappedGetters = {};

    // 收集通过 store.subcribe 订阅状态变更事件的处理函数 fn
    // 当 mutation 执行时，触发全部订阅事件执行，返回当前 mutation 和更新后的状态
    this._subscribes = [];

    // 1,模块收集：options 格式化 -> Vuex 模块树
    this._modules = new ModuleCollection(options);
    console.log("格式化后的模块树对象", this._modules)

    // 2,模块安装：
    // 模块安装处理 mutation 时，触发状态变更订阅事件通知
    installModule(this, state, [], this._modules.root);
    console.log("模块安装结果:_mutations", this._mutations)
    console.log("模块安装结果:_actions", this._actions)
    console.log("模块安装结果:_wrappedGetters", this._wrappedGetters)
    console.log("模块安装结果:state", state)

    // 3,将 state 状态、getters 定义在当前的 vm 实例上
    resetStoreVM(this, state);

    // 依次执行 options 选项中的 plugins 插件,传入当前 store 实例
    options.plugins.forEach(plugin => plugin(this));
  }

  // Vuex 状态替换
  replaceState(state){
    this._vm._data.$$state = state
  }

  // 提供 store.subscribe 状态变更事件订阅功能
  // 将回调函数统计收集到 _subscribes 数组中；
  subscribe(fn) {
    console.log("订阅 Vuex 状态变化，收集处理函数")
    this._subscribes.push(fn);
    console.log("this._subscribes", this._subscribes)
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
    // 旧：执行 mutations 对象中对应的方法，并传入 payload 执行
    // this.mutations[type](payload)
    // 新：不再去 mutations 对象中查找，直接在 _mutations 中找到 type 对应的数组，依次执行
    console.log(this._mutations)
    console.log(type)
    this._mutations[type].forEach(mutation => mutation.call(this, payload))
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
    // 旧：执行 actions 对象中对应的方法，并传入 payload 执行
    // this.actions[type](payload)
    // 新：不再去 actions 对象中查找，直接在 _actions 中找到 type 对应的数组，依次执行
    this._actions[type].forEach(action => action.call(this, payload))
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