<template>
    <div class="sudoku" v-if="puzzle !== null"
         ref="sudoku"
         v-click-outside="deselectAll">
        <perfect-scrollbar class="scroller">
            <create-controls class="create panel"></create-controls>
        </perfect-scrollbar>

        <div tabindex="1" @keydown="keyPress" class="play-area">
            <div class="sudoku-panel panel">
                <sudoku-visualize
                        @mousedown.native="mouseDown"
                        ref="sudokuVisualize"
                        :cursor="cursor"
                        :puzzle="puzzle"></sudoku-visualize>
                <!--                <html-visualize @mousedown.native="mouseDown"-->
                <!--                                ref="sudokuVisualize"-->
                <!--                                :cursor="cursor"-->
                <!--                                :puzzle="puzzle"></html-visualize>-->
                <div class="possible-values" v-if="selected.setDomain">
                    <h4>Possible values</h4>
                    <v-chip-group>
                        <v-chip small v-for="v in selected.setDomain">{{v}}</v-chip>
                    </v-chip-group>
                </div>
            </div>

            <perfect-scrollbar class="scroller">
                <play-controls class="play panel"></play-controls>
            </perfect-scrollbar>
        </div>
    </div>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";
    import PlayControls from "@/components/controls-panel/PlayControls";
    import SudokuVisualize from "@/components/SudokuVisualize";
    import CreateControls from "@/components/create-panel/CreateControls";
    import HtmlVisualize from "@/components/HTMLVisualize";

    // TODO
    // Create puzzle stuff,
    // add key binds for more stuff
    // add undo redo
    // check keep
    // add editable prop to sudoku.vue to show Create panel and stuff
    // add mobile support
    // check if parameter count of custom function matches selected variable count
    // show direction of constraint cells
    // update solvability and arc consistency when changing constraints in any way (edit/create/delete)
    // when publishing convert thermometers/background to data url images?
    // IT SEEMS TOO MANY WOREKRS ARE SPAWNED AND NOT KILLED! WHEN EDITING A CONSTRAINT AND STUFF YEA

    export default {
        name: "Sudoku",
        components: {
            HtmlVisualize,
            CreateControls,
            SudokuVisualize,
            PlayControls
        },
        props: {},
        data: () => ({
            sudokuMouseDown: false,
            cursor: 'default',
        }),
        mounted() {
            document.addEventListener('mousemove', this.mouseMove, false);
            document.addEventListener('mouseup', this.mouseUp, false);
        },
        beforeDestroy() {
            document.removeEventListener('mousemove', this.mouseMove);
            document.removeEventListener('mouseup', this.mouseUp);
        },
        methods: {
            select(cell) {
                if (!this.selectedCells.includes(cell)) {
                    this.selectedCells.push(cell);
                }
            },
            deselect(cell) {
                let index = this.selectedCells.indexOf(cell);
                if (index !== -1) {
                    this.selectedCells.splice(index, 1);
                }
            },
            deselectAll() {
                this.selectedCells.splice(0, this.selectedCells.length);
            },
            mouseDown(e) {
                this.sudokuMouseDown = true;
                if (!e.shiftKey && !e.ctrlKey)
                    this.deselectAll();

                let [, , puzzleX, puzzleY] = this.eventToPos(e);
                let cellSize = this.box.width / this.sudokuVisualize.width;
                let [cellX, cellY] = [Math.floor(puzzleX / cellSize), Math.floor(puzzleY / cellSize)];
                if (this.grid[cellY] && this.grid[cellY][cellX]) {
                    if (!e.ctrlKey)
                        this.select(this.grid[cellY][cellX]);
                    else
                        this.deselect(this.grid[cellY][cellX]);
                }
            },
            mouseMove(e) {
                let [x, y] = this.eventToPos(e);
                if (x > this.box.x && y > this.box.y && x < this.box.x + this.box.width && y < this.box.y + this.box.height) {
                    this.cursor = 'pointer';
                } else {
                    this.cursor = 'default';
                }
                if (this.sudokuMouseDown)
                    this.dragCanvas(e);
            },
            mouseUp() {
                this.sudokuMouseDown = false;
            },
            eventToPos(e) {
                if (!this.boardElement)
                    return [0, 0, 0, 0];
                if (false) { // html visualize
                    let puzzleX = e.pageX - this.box.x;
                    let puzzleY = e.pageY - this.box.y;
                    return [0, 0, puzzleX, puzzleY];
                } else { // canvas visualize
                    let {left, top} = this.boardElement.getBoundingClientRect();
                    let x = e.pageX - left;
                    let y = e.pageY - top;
                    let puzzleX = x - this.box.x;
                    let puzzleY = y - this.box.y;
                    return [x, y, puzzleX, puzzleY];
                }
            },
            dragCanvas(e) {
                let [, , puzzleX, puzzleY] = this.eventToPos(e);
                let cellSize = this.box.width / this.sudokuVisualize.width;
                let [cellX, cellY] = [puzzleX / cellSize, puzzleY / cellSize];
                let [offX, offY] = [cellX % 1, cellY % 1];
                [cellX, cellY] = [Math.floor(cellX), Math.floor(cellY)];
                if (this.grid[cellY] && this.grid[cellY][cellX]) {
                    let dist = Math.sqrt((offX - 0.5) ** 2 + (offY - 0.5) ** 2);
                    if (dist <= 0.5 && !e.ctrlKey)  // Within radius 0.5 of center of cell
                        this.select(this.grid[cellY][cellX]);
                    else if (dist <= 0.5)
                        this.deselect(this.grid[cellY][cellX]);
                }
            },
            keyPress(e) {
                this.processKey(e.key);
            },
            moveSelection(x = 0, y = 0) {
                if (this.selectedCells.length === 0) {
                    this.selectedCells.push(this.grid[y][x]);
                    return;
                }
                let cell = this.selectedCells[0];
                y += cell.y;
                x += cell.x;
                if (this.grid[y]?.[x]) {
                    this.$store.commit('selectedCells', [this.grid[y][x]]);
                }
            },
            processKey(key) {
                switch (key) {
                    case 'ArrowLeft':
                        this.moveSelection(-1, 0);
                        break;
                    case 'ArrowRight':
                        this.moveSelection(1, 0);
                        break;
                    case 'ArrowUp':
                        this.moveSelection(0, -1);
                        break;
                    case 'ArrowDown':
                        this.moveSelection(0, 1);
                        break;
                    case 'Backspace':
                    case 'Delete':
                        this.clearCells();
                        break;
                    default:
                        if (key.length === 1 && (this.mode === 'domain' || this.mode === 'pencilMarks')) {
                            let value = isNaN(+key) ? key : +key;
                            this.setCellsValue({type: this.mode, value});
                        }
                        break;
                }
            },
            ...mapActions([
                'setCellsValue',
                'updateCellInfo',
                'updateRelevantCells',
                'updateRelevantConstraints',
                'clearCells',
                'updateSolvability',
                'updateConsistentDomains',
            ]),
        },
        watch: {
            selectedCells() {
                this.updateRelevantConstraints();
                this.updateRelevantCells();
                this.updateCellInfo();
            },
            options: {
                deep: true,
                handler() {
                    localStorage.puzzleOptions = JSON.stringify(this.options);
                }
            },
            showVisualOptions() {
                localStorage.showVisualOptions = this.showVisualOptions;
            },
            showInputsOptions() {
                localStorage.showInputsOptions = this.showInputsOptions;
            },
            showRulesOptions() {
                localStorage.showRulesOptions = this.showRulesOptions;
            },
            puzzle() {
                if (this.options.autoSolve)
                    this.updateSolvability();
                if (this.options.consistentDomains)
                    this.updateConsistentDomains()
                // let result = this.puzzle.solve();
                // console.log(result);
                // for (let key in result.solutions[0]) {
                //     let [x, y] = key.split(',').map(n => +n);
                //     let cell = this.grid[y][x];
                //     let value = result.solutions[0][key];
                //     cell.user.domain.splice(0, cell.user.domain.length);
                //     cell.user.domain.push(value);
                // }
            },
        },
        computed: {
            sudokuVisualize() {
                return this.$refs.sudokuVisualize;
            },
            boardElement() {
                return this.sudokuVisualize.$el;
            },
            ...mapGetters(['editableCells', 'grid', 'flatGrid', 'maxDomainLength']),
            ...mapState({
                selected: state => state.sudoku.selected,
                puzzle: state => state.sudoku.puzzle,
                mode: state => state.sudoku.mode,
                selectedCells: state => state.sudoku.selectedCells,
                box: state => state.sudoku.box,
                options: state => state.sudoku.options,
            })
        },
    }
</script>

<style scoped>
    .sudoku {
        display: flex;
        height: 100%;
        width: 100%;
    }

    .scroller {
        max-height: 100%;
        overflow-y: auto;
        position: relative;
    }

    .panel {
        display: inline-flex;
    }

    .create {
        margin-right: 1em;
    }

    .play {
        margin-left: 1em;
    }

    .sudoku-panel {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        max-width: 800px;
    }

    .possible-values {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .play-area {
        display: flex;
        flex-grow: 1;
    }

    .play-area:focus {
        outline: none;
    }
</style>