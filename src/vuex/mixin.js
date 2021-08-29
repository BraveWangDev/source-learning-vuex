/**
 * 将根组件中注入store实例，混入到所有子组件上
 * @param {*} Vue 
 */
export default function applyMixin(Vue) {
  // 通过 beforeCreate 生命周期，在组件创建前，实现全局混入
  Vue.mixin({
    beforeCreate: vuexInit,
  });
}

function vuexInit() {
  const options = this.$options;
  // 如果选项中拥有store属性,说明是根实例;其他情况都是子实例
  if (options.store) {// 根实例
    // 为根实例添加 $store 属性，指向 store 实例
    this.$store = options.store;
  } else if (options.parent && options.parent.$store) { // 子实例
    // 儿子可以通过父亲拿到 $store 属性，放到自己身上继续给儿子
    this.$store = options.parent.$store;
  }
}