<template>
    <div class="home">
        <h1>sudoku</h1>
    </div>
</template>

<script>
    import {Puzzle} from 'puzzle-solver';
    import {solve} from "@/js/WorkerSolve";

    export default {
        name: 'Home',
        components: {},
        async mounted() {
            await this.timeSolve();
        },
        methods: {
            async timeSolve() {
                let puzzle = Puzzle.presets.getSudoku();

                console.log("Solving puzzles", puzzle);
                let concurrentCount = 20;
                let promises = [...Array(concurrentCount)].map((_, i) => {
                    let puzz = puzzle.copy();
                    puzz.domains[[0, i % 9]] = [Math.floor(Math.random() * 10)];
                    console.log(puzz.consistentDomains);
                    return solve(puzz, 2)
                });
                console.log(promises);
                let now = performance.now();
                await Promise.all(promises);
                let time = performance.now() - now;
                console.log(`Time for running solve ${concurrentCount} times: ${time}`);
            },
        },
    }
</script>
