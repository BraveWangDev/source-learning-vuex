export default {
  namespaced: true,
  state: {
    num: 40
  },
  getters: {
  },
  mutations: {
    changeNum(state, payload) {
      state.num += payload;
    }
  },
  actions: {
  }
};