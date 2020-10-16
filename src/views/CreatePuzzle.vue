<template>
    <div class="create-preset">

    </div>
</template>

<script>
    import {Puzzle} from 'puzzle-solver';

    export default {
        name: "CreatePreset",
        components: {},
        data: () => ({
            grid: {
                height: 9,
                width: 9,
            },
            puzzle: {},
        }),
        mounted() {
            let sudoku = Puzzle.presets.getSudoku();
            console.log(sudoku, sudoku.solve(5));
            // todo visualize this sudoku
        },
        methods: {},
        watch: {},
        computed: {},
    }
</script>

<style scoped>
    .create-preset {
        padding: 20px;
    }
</style>