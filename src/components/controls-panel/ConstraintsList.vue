<template>
    <v-list class="constraints-list">
        <constraint-group :editable="editable" :group="puzzle.constraintGroups"></constraint-group>
    </v-list>
</template>

<script>
    import ConstraintGroup from "@/components/ConstraintGroup";
    import {mapState} from "vuex";

    export default {
        name: "ConstraintsList",
        components: {ConstraintGroup},
        props:{
            editable: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            ...mapState({
                puzzle: state => state.sudoku.puzzle,
            })
        }
    }
</script>

<style scoped>
    .constraints-list {
        max-height: 400px;
        overflow-y: auto;
    }
</style>