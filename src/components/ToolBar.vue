<template>
    <v-app-bar elevation="1" app class="toolbar">
        <logo :hide-name="true" class="logo" v-if="$store.getters.scale < 2"></logo>
        <v-toolbar-title>{{$route.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" class="mr-1" icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-face</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-list-item-title>Log out</v-list-item-title>
                </v-list-item>
                <v-list-item color="primary">
                    <v-list-item-icon>
                        <v-icon>mdi-brightness-6</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title class="theme-switch">
                            <span>Dark theme</span>
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-switch dense inset v-model="$vuetify.theme.dark"></v-switch>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>

<script>
    import Logo from "./Logo";

    export default {
        name: "ToolBar",
        components: {Logo},
        data: () => ({}),
        mounted() {
        },
        methods: {},
        watch: {
            '$vuetify.theme.dark'() {
                localStorage.darkTheme = this.$vuetify.theme.dark;
            },
        },
    }
</script>

<style scoped>
    .logo {
        margin-left: -15px;
    }
</style>