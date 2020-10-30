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
                let response = await fetch('./wasmtest.wasm');
                let bytes = await response.arrayBuffer();
                let wasm = await WebAssembly.instantiate(bytes)

                console.log(wasm);
            },
        },
    }
</script>
