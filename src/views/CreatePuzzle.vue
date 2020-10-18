<template>
    <div class="create-preset">
        <sudoku></sudoku>
    </div>
</template>

<script>
    import {Puzzle, PuzzleConstraint} from 'puzzle-solver';
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
            puzzle.domains[[4, 4]] = [5];
            puzzle.domains[[4, 5]] = [6];
            puzzle.domains[[5, 6]] = [4];
            // puzzle.domains[[6, 4]] = [4, 5, 6];
            // puzzle.domains[[7, 4]] = [4, 5, 6];
            puzzle.pencilMarks[[3, 3]] = [1, 2, 3, 7, 8];
            puzzle.domains[[3, 3]] = [1, 2, 3, 4];
            let knight = new PuzzleConstraint('Knights move', 'knightsMove');
            let king = new PuzzleConstraint('Kings move', 'kingsMove');
            puzzle.addConstraint(king)
            puzzle.addConstraint(knight)
            console.log(Puzzle, puzzle, knight)
            this.$store.commit('puzzle', puzzle);
        },
        methods: {},
        watch: {},
        computed: {},
    }
</script>

<style scoped>
    .create-preset {
        height: 100%;
        padding: 20px;
    }
</style>