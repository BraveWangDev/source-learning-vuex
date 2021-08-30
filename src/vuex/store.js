import applyMixin from "./mixin";
import { forEachValue } from './util';

// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

// 容器的初始化
export class Store {
  constructor(options) { // options:{state, mutation, actions}
    const state = options.state;  // 获取 options 选项中的 state 对象

    // 响应式数据:new Vue({data})
    this._vm = new Vue({
      data: {
        // 在 data 中，默认不会将以$开头的属性挂载到 vm 上
        $$state: state // $$state 对象将通过 defineProperty 进行属性劫持
      }
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