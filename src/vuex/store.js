import applyMixin from "./mixin";
import ModuleCollection from "./module/module-collection";
// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

// 容器的初始化
export class Store {
  constructor(options) {
    const state = options.state;

    // options 格式化 -> Vuex 模块树
    this._modules = new ModuleCollection(options);
    console.log("格式化后的模块树对象", this._modules)

    // // 获取 options 选项中的 getters 对象：内部包含多个方法
    // const getters = options.getters;
    // // 声明 store 实例中的 getters 对象
    // this.getters = {};
    // // 将 options.getters 中的方法定义到计算属性中
    // const computed = {}

    // // 页面通过“{{this.$store.getters.getPrice}}”取值，取的是 getters 对象中的属性
    // // 所以，需要将将用户传入的 options.getters 属性中的方法,转变成为 store 实例中的 getters 对象上对应的属性
    // Object.keys(getters).forEach(key => {
    //   // 将 options.getters 中定义的方法，放入计算属性 computed 中，即定义在 Vue 的实例 _vm 上
    //   computed[key] = () => {
    //     return getters[key](this.state)
    //   }

    //   // 将 options.getters 中定义的方法，绑定到 store 实例中的 getters 对象
    //   Object.defineProperty(this.getters, key, {
    //     // 旧：// 取值操作时，执行 options 中对应的 getters 方法（添加computed后废弃，使用逻辑）
    //     // get: () => options.getters[key](this.state)
    //     // 新：取值操作时,执行计算属性逻辑
    //     get: () => this._vm[key]
    //   })
    // });

    // // 响应式数据:new Vue({data})
    // this._vm = new Vue({
    //   data: {
    //     // 在 data 中，默认不会将以$开头的属性挂载到 vm 上
    //     $$state: state // $$state 对象将通过 defineProperty 进行属性劫持
    //   },
    //   computed // 将 options.getters 定义到 computed 实现数据缓存
    // })

    // // 声明 store 实例中的 mutations 对象
    // this.mutations = {};
    // // 获取 options 选项中的 mutations 对象
    // const mutations = options.mutations;
    // // 将 options.mutations 中定义的方法，绑定到 store 实例中的 mutations 对象
    // Object.keys(mutations).forEach(key => {
    //   // payload:commit 方法中调用 store 实例中的 mutations 方法时传入
    //   this.mutations[key] = (payload) => mutations[key](this.state, payload);
    // });

    // // 声明 store 实例中的 actions 对象
    // this.actions = {};
    // // 获取 options 选项中的 actions 对象
    // const actions = options.actions;
    // // 将 options.actions 中定义的方法，绑定到 store 实例中的 actions 对象
    // Object.keys(actions).forEach(key => {
    //   // payload:dispatch 方法中调用 store 实例中的 actions 方法时传入
    //   this.actions[key] = (payload) => actions[key](this, payload);
    // });
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