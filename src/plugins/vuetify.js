import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

if (localStorage.getItem('darkTheme') === null)
    localStorage.darkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export default new Vuetify({
    theme: {
        dark: localStorage.darkTheme === 'true',
        themes: {
            dark: {
                primary: '#ff9225',
                sudoku: {
                    selection: '#FFFFFF33',
                    constrained: '#FF000066',
                    same: '#00FF0033',
                    relevant: '#00FFFF33',
                },
                foreground: '#ffffff',
                softForeground: '#c6c6c6',
                primaryLight: '#19191a',
                secondary: '#3ac7ab',
            },
            light: {
                primary: '#f35804',
                sudoku: {
                    selection: '#00000033',
                    constrained: '#DD7700FF',
                    same: '#00FF0033',
                    relevant: '#00FFFF33',
                },
                foreground: '#1a1a1a',
                softForeground: '#282828',
                primaryLight: '#f1efef',
                secondary: '#2850e5',
            },
        },
    }
});
