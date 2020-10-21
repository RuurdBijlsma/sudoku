<template>
    <div>
        <v-switch label="Same" v-model="visualOptions.same"></v-switch>
        <v-switch label="Relevant" v-model="visualOptions.relevant"></v-switch>
        <v-switch label="Constraints" v-model="visualOptions.constrained"></v-switch>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "VisualOptions",
        computed: {
            ...mapState({
                visualOptions: state => state.sudoku.visualOptions,
            })
        },
    }
</script>

<style scoped>

</style>