import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        windowWidth: window.innerWidth,
    },
    mutations: {
        windowWidth: (state, value) => state.windowWidth = value,
    },
    getters: {
        scale: state => {
            if (state.windowWidth > 1100) {
                return 3;
            } else if (state.windowWidth > 800) {
                return 2;
            } else if (state.windowWidth > 400) {
                return 1;
            } else {
                return 0;
            }
        }
    },
    actions: {},
    modules: {}
})
