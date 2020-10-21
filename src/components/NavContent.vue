<template>
    <perfect-scrollbar class="nav-bar">
        <div class="nav-top">
            <div class="top-bar">
                <logo class="logo" v-if="!$store.state.miniDrawer"></logo>
                <v-btn icon @click="$store.state.miniDrawer = !$store.state.miniDrawer" class="ma-2">
                    <v-icon>{{$store.state.miniDrawer ? 'mdi-chevron-right' : 'mdi-chevron-left'}}</v-icon>
                </v-btn>
            </div>
            <search-input v-if="!$store.state.miniDrawer" class="search-input"></search-input>
        </div>

        <v-list dense nav class="py-0">
            <v-list-item :to="link.to" exact v-for="link in navigation" :key="link.to">
                <v-list-item-icon>
                    <v-icon color="primary">{{link.icon}}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{link.name}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </perfect-scrollbar>
</template>

<script>
    import Logo from "./Logo";
    import SearchInput from "./SearchInput";

    export default {
        name: "NavContent",
        components: {SearchInput, Logo},
        props: {
            navigation: {
                type: Array,
                default: () => [],
            },
        },
        data: () => ({}),
        mounted() {
        },
        methods: {},
        watch: {
            '$store.state.miniDrawer'() {
                localStorage.miniDrawer = this.$store.state.miniDrawer;
            },
        },
    }
</script>

<style scoped>
    .nav-bar {
        height: 100%;
        width: 100%;
    }

    .top-bar {
        display: flex;
        align-items: center;
    }

    .logo {
        flex-grow: 1;
    }

    .search-input {
        margin: 15px !important;
        margin-bottom: 0 !important;
    }
</style>