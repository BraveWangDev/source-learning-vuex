import moduleC from './moduleC'

export default {
  namespaced: true,
  state: {
    num: 20
  },
  getters: {
  },
  mutations: {
    changeNum(state, payload) {
      state.num += payload;
    }
  },
  actions: {
  },
  modules: {
    moduleC
  }
};