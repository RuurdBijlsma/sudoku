<template>
    <div class="sudoku" v-if="puzzle !== null"
         ref="sudoku"
         tabindex="1"
         @keydown="keyPress">
        <!--        <div class="create panel">-->
        <!--            <h2>Create</h2>-->
        <!--        </div>-->
        <!--        <draggable-divider></draggable-divider>-->
        <div class="sudoku-panel">
            <sudoku-board
                    @click.native="clickCanvas"
                    @mousedown.native="mouseDown"
                    ref="sudokuBoard"
                    :cursor="cursor"
                    :puzzle="puzzle"></sudoku-board>
            <div class="possible-values" v-if="highlighted.setDomain">
                <h4>Possible values</h4>
                <v-chip-group>
                    <v-chip small v-for="v in highlighted.setDomain">{{v}}</v-chip>
                </v-chip-group>
            </div>
        </div>
        <draggable-divider></draggable-divider>
        <div class="controls panel">
            <div class="visuals">
                <div class="visuals-title">
                    <h4>Visuals</h4>
                    <v-btn icon
                           @click="showVisualOptions = !showVisualOptions">
                        <v-icon>{{ showVisualOptions ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                </div>
                <v-divider></v-divider>
                <v-expand-transition>
                    <div v-show="showVisualOptions">
                        <v-switch label="Same" v-model="visualOptions.same"></v-switch>
                        <v-switch label="Relevant" v-model="visualOptions.relevant"></v-switch>
                        <v-switch label="Constraints" v-model="visualOptions.constrained"></v-switch>
                    </div>
                </v-expand-transition>
            </div>
            <div class="inputs">
                <div class="visuals-title">
                    <h4>Inputs</h4>
                    <v-btn icon
                           @click="showInputsOptions = !showInputsOptions">
                        <v-icon>{{ showVisualOptions ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                </div>
                <v-divider></v-divider>
                <v-expand-transition>
                    <div v-show="showInputsOptions">
                        <v-chip-group class="mb-3" color="primary" v-model="$store.state.sudoku.mode" mandatory>
                            <v-chip value="domain">Domain</v-chip>
                            <v-chip value="pencilMarks">Pencil</v-chip>
                            <v-chip value="color">Colour</v-chip>
                        </v-chip-group>
                        <div class="control-grid numbers" v-if="mode !== 'color'">
                            <v-btn
                                    @click="setCellsValue(mode, i)"
                                    :color="highlighted[mode] && highlighted[mode].includes(i.toString()) ? 'secondary' : 'default'"
                                    class="number-button"
                                    large fab
                                    v-for="i in 9" :key="i">{{i}}
                            </v-btn>
                        </div>
                        <div class="colors" v-else>
                            <v-color-picker
                                    @click.native="applyColor"
                                    v-model="highlighted.color"
                                    width="230"
                                    dot-size="15"
                                    show-swatches
                                    mode="rgba"
                                    :swatches="colorOptions"
                                    swatches-max-height="150"
                                    hide-inputs
                            ></v-color-picker>
                        </div>
                        <v-btn class="clear-button" @click="clearCells">
                            Clear {{mode}}
                        </v-btn>
                        <div class="control-buttons">
                            <v-btn>
                                <v-icon>mdi-undo</v-icon>
                                Undo
                            </v-btn>
                            <v-btn>
                                <v-icon>mdi-redo</v-icon>
                                Redo
                            </v-btn>
                            <v-btn>
                                <v-icon color="error">mdi-restart</v-icon>
                                Restart
                            </v-btn>
                            <v-btn>
                                <v-icon color="success">mdi-check</v-icon>
                                Check
                            </v-btn>
                        </div>
                    </div>
                </v-expand-transition>
            </div>
        </div>
    </div>
</template>

<script>
    import colorString from 'color-string';
    import SudokuBoard from "@/components/SudokuBoard";
    import DraggableDivider from "@/components/DraggableDivider";
    import {mapGetters, mapState} from "vuex";
    import GridCell from "@/js/GridCell";

    // TODO
    // show domain of highlighted cell to the right (change common thing back to vuex module thing)
    // Create puzzle stuff,
    // show list of constraints,
    // add constraint to selected cells or global constraint
    // allow resize of panels
    //add keybinds for more stuff
    //add undo redo
    //check keep
    //solve puzzle
    //move solver to worker
    //show rules on current sudoku when playing
    //add editable prop to sudoku.vue to show Create panel and stuff

    export default {
        name: "Sudoku",
        components: {DraggableDivider, SudokuBoard},
        props: {},
        data: () => ({
            colorOptions: [
                [
                    '#000000',
                    '#686868',
                    '#ffffff',
                ],
                [
                    '#ff0000',
                    '#ff7700',
                    '#ffe900',
                ],
                [
                    '#00ff04',
                    '#dd2fff',
                    '#00b7ff',
                ],
            ],
            isMouseDown: false,
            cursor: 'default',
            highlighted: {
                domain: false,
                setDomain: false,
                pencilMarks: false,
                color: '#ff0000ff',
            },
            showVisualOptions: (localStorage.getItem('showVisualOptions') ?? 'false') === 'true',
            showInputsOptions: (localStorage.getItem('showInputsOptions') ?? 'true') === 'true',
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
            handleInput() {
                this.updateCellInfo();
                this.updateRelevantCells();
            },
            updateRelevantCells() {
                let commonDomain = this.$store.getters.common(this.highlightedCells, c => Array.from(c.user.domain));
                if (commonDomain.length === 0) {
                    commonDomain = this.$store.getters.common(this.highlightedCells, c => c.domain);
                    if (commonDomain.length === this.maxDomainLength) {
                        this.$store.commit('sameCells', []);
                        this.$store.commit('relevantCells', []);
                        return;
                    }
                }

                let domainString = commonDomain.toString();
                let sameCells = this.flatGrid.filter(cell => {
                    if (this.highlightedCells.includes(cell))
                        return false;
                    let userDomain = [...cell.user.domain];
                    if (userDomain.length === 0) {
                        return domainString === cell.domain.toString();
                    }
                    return domainString === userDomain.toString();
                });

                let relevantCells = commonDomain.length === 1 ?
                    this.flatGrid.filter(cell => {
                        if (this.highlightedCells.includes(cell))
                            return false;
                        let value = commonDomain[0].toString();
                        if (cell.user.domain.has(value))
                            return true;
                        let pencilMarks = cell.hasUserPencilMarks ? [...cell.user.pencilMarks] : cell.pencilMarks.map(p => p.toString());
                        if (!cell.hasValue && pencilMarks.includes(value))
                            return true
                        if (!cell.hasValue && cell.domain.length < this.maxDomainLength)
                            return cell.domain.map(p => p.toString()).includes(value);
                        return false;
                    }) : [];
                relevantCells = relevantCells.filter(c => !sameCells.includes(c))

                this.$store.commit('sameCells', sameCells);
                this.$store.commit('relevantCells', relevantCells);
            },
            updateCellInfo() {
                this.highlighted.domain = this.$store.getters.common(this.editableCells, c => Array.from(c.user.domain));
                this.highlighted.setDomain = this.$store.getters.common(this.highlightedCells, c => c.domain);
                this.highlighted.pencilMarks = this.$store.getters.common(this.editableCells, c => Array.from(c.user.pencilMarks));
                let color = this.$store.getters.common(this.editableCells, c => c.user.color ?? 'null');
                this.setHighlightedColor(color);
            },
            updateRelevantConstraints() {
                if (this.highlightedCells.length === 0)
                    return this.$store.commit('constrainedCells', []);

                let hCells = this.highlightedCells.map(c => [c.x, c.y].toString());
                let constraintsOnCell = {};
                for (let hCell of hCells) {
                    [...new Set(
                        this.puzzle.usableConstraints
                            .filter(c => c.variables.find(c => c.toString() === hCell))
                            .flatMap(c => c.variables)
                            .map(c => c.toString())
                            .filter(c => hCell !== c)
                    )].forEach(c => {
                        if (!constraintsOnCell[c])
                            constraintsOnCell[c] = 0;
                        constraintsOnCell[c]++;
                    });
                }
                let constrainedCells = [];
                for (let key in constraintsOnCell)
                    if (constraintsOnCell[key] === hCells.length) {
                        let [x, y] = key.split(',').map(n => +n);
                        constrainedCells.push(this.grid[y][x]);
                    }
                this.$store.commit('constrainedCells', constrainedCells);
            },
            setHighlightedColor(color) {
                if (color === false)
                    return;
                if (color === null || color === 'null')
                    color = 'transparent';
                let [r, g, b, a] = colorString.get.rgb(color);
                a = Math.max(a * 3, 1);
                this.highlighted.color = colorString.to.hex([r, g, b, a]);
            },
            applyColor() {
                let [r, g, b, a] = colorString.get.rgb(this.highlighted.color);
                a = a / 3;
                this.highlightedCells.forEach(c => c.user.color = colorString.to.hex([r, g, b, a]));
            },
            highlight(cell) {
                if (!this.highlightedCells.includes(cell)) {
                    this.highlightedCells.push(cell);
                }
            },
            unhighlight(cell) {
                let index = this.highlightedCells.indexOf(cell);
                if (index !== -1) {
                    this.highlightedCells.splice(index, 1);
                }
            },
            unhighlightAll() {
                this.highlightedCells.splice(0, this.highlightedCells.length);
            },
            mouseDown(e) {
                this.isMouseDown = true;
                if (!e.shiftKey && !e.ctrlKey)
                    this.unhighlightAll();

                let [, , puzzleX, puzzleY] = this.eventToPos(e);
                let cellSize = this.box.width / this.sudokuBoard.width;
                let [cellX, cellY] = [Math.floor(puzzleX / cellSize), Math.floor(puzzleY / cellSize)];
                if (this.grid[cellY] && this.grid[cellY][cellX]) {
                    if (!e.ctrlKey)
                        this.highlight(this.grid[cellY][cellX]);
                    else
                        this.unhighlight(this.grid[cellY][cellX]);
                }
            },
            mouseMove(e) {
                let [x, y] = this.eventToPos(e);
                if (x > this.box.x && y > this.box.y && x < this.box.x + this.box.width && y < this.box.y + this.box.height) {
                    this.cursor = 'pointer';
                } else {
                    this.cursor = 'default';
                }
                if (this.isMouseDown)
                    this.dragCanvas(e);
            },
            mouseUp() {
                this.isMouseDown = false;
            },
            eventToPos(e) {
                if (!this.boardElement)
                    return [0, 0, 0, 0];
                let {left, top} = this.boardElement.getBoundingClientRect();
                let x = e.pageX - left;
                let y = e.pageY - top;
                let puzzleX = x - this.box.x;
                let puzzleY = y - this.box.y;
                return [x, y, puzzleX, puzzleY];
            },
            dragCanvas(e) {
                let [, , puzzleX, puzzleY] = this.eventToPos(e);
                let cellSize = this.box.width / this.sudokuBoard.width;
                let [cellX, cellY] = [puzzleX / cellSize, puzzleY / cellSize];
                let [offX, offY] = [cellX % 1, cellY % 1];
                [cellX, cellY] = [Math.floor(cellX), Math.floor(cellY)];
                if (this.grid[cellY] && this.grid[cellY][cellX]) {
                    let dist = Math.sqrt((offX - 0.5) ** 2 + (offY - 0.5) ** 2);
                    if (dist <= 0.5 && !e.ctrlKey)  // Within radius 0.5 of center of cell
                        this.highlight(this.grid[cellY][cellX]);
                    else if (dist <= 0.5)
                        this.unhighlight(this.grid[cellY][cellX]);
                }
            },
            clickCanvas(e) {
            },
            keyPress(e) {
                this.processKey(e.key);
            },
            processKey(key) {
                if (key === 'Delete' || key === 'Backspace') {
                    this.clearCells();
                }
                if (key.length === 1 && (this.mode === 'domain' || this.mode === 'pencilMarks')) {
                    this.setCellsValue(this.mode, key);
                }
            },
            clearCells() {
                if (this.mode === 'color')
                    this.highlightedCells.forEach(c => c.user.color = null);

                for (let cell of this.editableCells) {
                    if (this.mode !== 'color') {
                        cell.user[this.mode].clear();
                        this.updateCellInfo();
                    }
                }
            },
            setCellsValue(valueType, v) {
                v = v.toString();
                if (valueType !== 'color') {
                    let isInDomain = this.editableCells?.[0]?.user?.[valueType]?.has(v);

                    let change = false;
                    for (let cell of this.editableCells) {
                        let collection = cell.user[valueType];
                        if (isInDomain) {
                            collection.delete(v);
                            change = true;
                        } else {
                            let maxSize = valueType === 'domain' ?
                                GridCell.maxDomainSize :
                                GridCell.maxPencilMarksSize;
                            if (collection.size < maxSize) {
                                collection.add(v);
                                change = true;
                            }
                        }
                    }
                    if (change) {
                        this.handleInput();
                    }

                    this.$refs.sudoku.focus();
                }
            },
        },
        watch: {
            highlightedCells() {
                this.updateRelevantConstraints();
                this.updateRelevantCells();
                this.updateCellInfo();
            },
            visualOptions: {
                deep: true,
                handler() {
                    localStorage.visualOptions = JSON.stringify(this.visualOptions);
                }
            },
            showVisualOptions() {
                localStorage.showVisualOptions = this.showVisualOptions;
            },
            showInputsOptions() {
                localStorage.showInputsOptions = this.showInputsOptions;
            },
            puzzle() {
                // let result = this.puzzle.solve();
                // console.log(result);
                // for (let key in result.solutions[0]) {
                //     let [x, y] = key.split(',').map(n => +n);
                //     let cell = this.grid[y][x];
                //     let value = result.solutions[0][key];
                //     cell.user.domain.clear();
                //     cell.user.domain.add(value);
                // }
            },
        },
        computed: {
            sudokuBoard() {
                return this.$refs.sudokuBoard;
            },
            boardElement() {
                return this.sudokuBoard.$el;
            },
            ...mapGetters(['editableCells', 'grid', 'flatGrid', 'maxDomainLength']),
            ...mapState({
                puzzle: state => state.sudoku.puzzle,
                mode: state => state.sudoku.mode,
                highlightedCells: state => state.sudoku.highlightedCells,
                box: state => state.sudoku.box,
                visualOptions: state => state.sudoku.visualOptions,
            })
        },
    }
</script>

<style scoped>
    .sudoku {
        display: flex;
        height: 100%;
    }

    .sudoku:focus {
        outline: none;
    }

    .panel {
        display: inline-flex;
        min-width: 150px;
        height: 300px;
    }

    .create {
    }

    .sudoku-panel {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .possible-values {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .controls {
        display: flex;
        flex-direction: column;
        width: 230px;
    }

    .visuals {
        margin-bottom: 10px;
    }

    .visuals-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .control-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 15px 5px;
        grid-template-areas:
            ". . ."
            ". . ."
            ". . .";
        justify-items: center;
    }

    .colors {
        gap: 5px 5px;
    }

    .colors >>> .v-color-picker__alpha {
        display: none;
    }

    .colors >>> .v-color-picker__hue {
        margin-bottom: 0 !important;
    }

    .number-button {
        font-size: 20px !important
    }

    .clear-button {
        margin: 10px 0;
    }

    .control-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px 5px;
        grid-template-areas:
            ". ."
            ". .";
        justify-items: center;
    }

    .control-buttons > * {
        width: 100%;
    }
</style>