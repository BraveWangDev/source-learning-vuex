import Vue from 'vue';
// import Vuex from 'vuex';
import Vuex from '@/vuex';
// 1.Vue.use(Vuex);  Vuex是一个对象 install方法
// 2.Vuex中有一个Store类 
// 3.混入到组件中 增添store属性

// 引入测试模块
import moduleA from './moduleA'
import moduleB from './moduleB'

// 注册 vuex 插件：内部会调用 Vuex 中的 install 方法
Vue.use(Vuex);

// 实例化容器容器:Vuex.Store
const store = new Vuex.Store({
  // state 状态：相当于组件中的 data 数据
  state: {
    num: 10
  },
  // getters 相当于计算属性（内部实现利用了计算属性）
  getters: {
    getPrice(state) {
      console.log("进入 getters - getPrice")
      return state.num * 10
    }
  },
  // 相当于 method，能够同步的更改 state
  mutations: {
    changeNum(state, payload) {
      console.log(`进入 mutations-changeNum：state = ${JSON.stringify(state)}, payload = ${payload}`)
      state.num += payload;
    }
  },
  // action作用:执行异步操作，并将结果提交给 mutations
  actions: {
    changeNum({ commit }, payload) {
      console.log(`进入 actions-changeNum：commit = ${JSON.stringify(commit)}, payload = ${payload}`)
      setTimeout(() => { // 模拟异步
        commit('changeNum', payload)
      }, 1000);
    }
  },
  modules: {
    moduleA,
    moduleB
  }
});
export default store; // 导出 store 实例，传入根组件