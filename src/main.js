import Vue from 'vue'
import App from './App.vue'
import store from './store/index' // 引入 store 实例

Vue.config.productionTip = false

new Vue({
  store,// 将 store 实例注入到 vue 中
  render: h => h(App),
}).$mount('#app');