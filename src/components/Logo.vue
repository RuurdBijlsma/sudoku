<template>
    <div class="logo">
        <img class="logo-image"
             :src="$vuetify.theme.dark ? './img/foreground.png' : './img/3d.png'"
             alt="logo image"/>
        <span class="name" v-if="!hideName">Sudoku</span>
    </div>
</template>

<script>
    export default {
        name: "Logo",
        props: {
            hideName: {
                type: Boolean,
                default: false,
            },
        },
    }
</script>

<style scoped>
    .logo {
        margin-top: 2px;
        margin-left: 2px;
        padding: 5px 15px;
        font-weight: bold;
        display: flex;
        -webkit-app-region: drag;
        align-items: center;
        justify-content: center;
    }

    .logo-image {
        height: 50px;
        margin-right: 15px;
        pointer-events: none;
    }

    .name {
        font-size: 20px;
        font-weight: 400;
    }
</style>