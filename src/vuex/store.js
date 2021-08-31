import applyMixin from "./mixin";

// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

// 容器的初始化
export class Store {
  constructor(options) { // options:{state, mutation, actions}
    // 获取 options 选项中的 state 对象
    const state = options.state;
    // 获取 options 选项中的 getters 对象：内部包含多个方法
    const getters = options.getters;
    // 声明 store 实例中的 getters 对象
    this.getters = {};
    // 将 options.getters 中的方法定义到计算属性中
    const computed = {}

    // 页面通过“{{this.$store.getters.getPrice}}”取值，取的是 getters 对象中的属性
    // 所以，需要将将用户传入的 options.getters 属性中的方法,转变成为 store 实例中的 getters 对象上对应的属性
    Object.keys(getters).forEach(key => {
      // 将 options.getters 中定义的方法，放入计算属性 computed 中，即定义在 Vue 的实例 _vm 上
      computed[key] = () => {
        return getters[key](this.state)
      }

      // 将 options.getters 中定义的方法，放入store 实例中的 getters 对象中
      Object.defineProperty(this.getters, key, {
        // 旧：// 取值操作时，执行 options 中对应的 getters 方法（添加computed后废弃，使用逻辑）
        // get: () => options.getters[key](this.state)
        // 新：取值操作时,执行计算属性逻辑
        get: () => this._vm[key]
      })
    });

    // 响应式数据:new Vue({data})
    this._vm = new Vue({
      data: {
        // 在 data 中，默认不会将以$开头的属性挂载到 vm 上
        $$state: state // $$state 对象将通过 defineProperty 进行属性劫持
      },
      computed // 将 options.getters 定义到 computed 实现数据缓存
    })
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