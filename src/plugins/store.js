import Vue from 'vue'
import Vuex from 'vuex'
import search from './search-module'
import sudoku from './sudoku-module'
import Vuetify from '../plugins/vuetify'
import colorString from 'color-string';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        windowWidth: window.innerWidth,
        miniDrawer: localStorage.getItem('miniDrawer') === null ? false : localStorage.miniDrawer === 'true',
        snackbars: [],
    },
    mutations: {
        windowWidth: (state, value) => state.windowWidth = value,
        addSnackObject: (state, snack) => state.snackbars.push(snack),
        removeSnack: (state, snack) => state.snackbars.splice(state.snackbars.indexOf(snack), 1),
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
        },
        notFoundUser: () => {
            let i = Math.floor(Math.random() * 7) + 1;
            return `img/user/${i}.png`;
        },
        themeColors() {
            return Vuetify.framework.theme.themes[Vuetify.framework.theme.isDark ? 'dark' : 'light'];
        },
        opaqueThemeColors: (state, getters) => {
            let colors = JSON.parse(JSON.stringify(getters.themeColors));
            let toOpaque;
            toOpaque = object => {
                for (let key in object) {
                    let value = object[key];
                    if (typeof value === "string") {
                        let [r, g, b,] = colorString.get.rgb(value);
                        object[key] = colorString.to.hex([r, g, b, 1]);
                    } else {
                        toOpaque(value);
                    }
                }
                return object;
            }
            return toOpaque(colors);
        }
    },
    actions: {
        addSnack: async ({state, commit}, {text, timeout = 3000}) => {
            let snack = {text, open: true, timeout};
            commit('addSnackObject', snack);
            return new Promise(resolve => {
                setTimeout(() => {
                    commit('removeSnack', snack);
                    resolve();
                }, timeout + 500);
            });
        },
    },
    modules: {search, sudoku}
})
