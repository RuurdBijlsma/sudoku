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
                foreground: '#ffffff',
                softForeground: '#c6c6c6',
                primaryLight: '#19191a',
                secondary: '#3ac7ab',
            },
            light: {
                primary: '#f35804',
                foreground: '#1a1a1a',
                softForeground: '#282828',
                primaryLight: '#f1efef',
                secondary: '#2850e5',
            },
        },
    }
});
