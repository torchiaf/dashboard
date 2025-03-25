export const state = function() {
  return {
    active: true
  };
};

export const getters = {
  active: (state) => {
    return state.active;
  }
};

export const mutations = {
  active(state, data) {
    state.active = data;
  },
};

export const actions = {
  hide({ commit } ) {
    commit('active', false);
  },

  show({ commit } ) {
    commit('active', true);
  },
};
