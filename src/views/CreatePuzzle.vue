<template>
    <div class="create-preset">
        <sudoku :puzzle="puzzle"></sudoku>
    </div>
</template>

<script>
    import {Puzzle} from 'puzzle-solver';
    import Sudoku from "@/components/Sudoku";

    export default {
        name: "CreatePreset",
        components: {Sudoku},
        data: () => ({
            grid: {
                height: 9,
                width: 9,
            },
            puzzle: new Puzzle(),
        }),
        mounted() {
            let puzzle = Puzzle.presets.getSudoku(9, 9, 3);
            puzzle.domains[[3, 4]] = [4];
            puzzle.colors[[3, 4]] = 'rgba(51,132,224,0.27)';
            puzzle.domains[[5, 4]] = [4, 5, 6];
            puzzle.domains[[6, 4]] = [4, 5, 6];
            puzzle.domains[[7, 4]] = [4, 5, 6];
            puzzle.pencilMarks[[3, 3]] = [1, 2, 3, 7, 8];
            puzzle.domains[[3, 3]] = [1, 2, 3, 4 ];
            puzzle.colors[[4, 3]] = 'red';
            puzzle.colors[[5, 3]] = 'rgba(196,82,82,0.8)';
            puzzle.colors[[5, 6]] = '#d5d55a';
            this.puzzle = puzzle;
            console.log(this.puzzle);

            // console.log(sudoku, sudoku.solve(5));
            // todo visualize this sudoku
        },
        methods: {},
        watch: {},
        computed: {},
    }
</script>

<style scoped>
    .create-preset {
        height:100%;
        padding: 20px;
    }
</style>