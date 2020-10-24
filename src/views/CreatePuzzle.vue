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
            puzzle.domains[[6, 4]] = [4, 5, 6];
            puzzle.domains[[7, 4]] = [4, 5, 6];
            puzzle.pencilMarks[[3, 3]] = [1, 2, 3, 4, 5, 6, 7, 8];
            puzzle.domains[[3, 6]] = [1, 2];
            puzzle.colors[[3, 3]] = 'rgba(255,0,0,0.3)';
            let thermometer = new PuzzleConstraint({
                name: "Thermometer",
                type: 'increasing',
                variables: [[0, 0], [0, 1], [0, 2], [1, 3], [2, 3]],
            });
            let cage = new PuzzleConstraint({
                name: "Cage",
                type: 'sumsTo',
                variables: [[5, 2], [5, 3], [6, 3]],
                value: 6,
            });
            let knight = new PuzzleConstraint({name: 'Knights move', type: 'knightsMove'});
            let king = new PuzzleConstraint({name: 'Kings move', type: 'kingsMove'});
            puzzle.addConstraint(thermometer)
            puzzle.addConstraint(knight)
            puzzle.addConstraint(king)
            puzzle.addConstraint(cage)
            // console.log(puzzle, knight)
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
        padding: 20px 20px 0;
    }
</style>