import applyMixin from "./mixin";

// 导出传入的 Vue 的构造函数，供插件内部的其他文件使用
export let Vue;

// 容器的初始化
export class Store {

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