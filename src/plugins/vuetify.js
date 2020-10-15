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
                primary: '#f34404',
                foreground: '#ffffff',
                primaryLight: '#2a2a2b',
                secondary: '#3364e0',
            },
            light: {
                primary: '#f34404',
                foreground: '#1a1a1a',
                primaryLight: '#f1efef',
                secondary: '#1b40c7',
            },
        },
    }
});
