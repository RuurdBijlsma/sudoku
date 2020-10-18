<template>
    <div class="sudoku" v-if="puzzle !== null"
         ref="sudoku"
         tabindex="1"
         @keydown="keyPress">
        <div class="create panel">
            <h2>Create</h2>
        </div>
        <draggable-divider></draggable-divider>
        <div class="sudoku-panel">
            <sudoku-board :puzzle="puzzle"></sudoku-board>
        </div>
        <draggable-divider></draggable-divider>
        <div class="controls panel">
            <v-chip-group class="mb-3" color="primary" v-model="$store.state.sudoku.mode" mandatory>
                <v-chip value="domain">Domain</v-chip>
                <v-chip value="pencilMarks">Pencil</v-chip>
                <v-chip value="colour">Colour</v-chip>
            </v-chip-group>
            <div class="control-grid numbers" v-if="mode !== 'colour'" :key="updateNumbersGrid">
                <v-btn
                        @click="setCellsValue(mode, i)"
                        :color="isInCommon(mode, i) ? 'secondary' : 'default'"
                        class="number-button"
                        large fab
                        v-for="i in 9" :key="i">{{i}}
                </v-btn>
            </div>
            <div class="colours" v-else>
                <v-color-picker
                        @click.native="applyColor"
                        v-model="activeColor"
                        width="230"
                        dot-size="15"
                        show-swatches
                        mode="rgba"
                        :swatches="colourOptions"
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
    </div>
</template>

<script>
    import {Puzzle} from "puzzle-solver";
    import SudokuBoard from "@/components/SudokuBoard";
    import DraggableDivider from "@/components/DraggableDivider";
    import {mapGetters, mapState} from "vuex";
    import GridCell from "@/js/GridCell";

    // TODO
    // SELECT CELLS
    // SHOW ALL CONSTRAINTS THAT APPLY TO ALL SELECTED CONSTRAINTS BY HIGHLIGHTING CELLS
    // HIGHLIGHT ON MOUSE HOVER
    // Highlight inputted values in cell on controls pane to the right

    export default {
        name: "Sudoku",
        components: {DraggableDivider, SudokuBoard},
        props: {},
        data: () => ({
            activeColor: '#ff0000',
            colourOptions: [
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
            updateNumbersGrid: 0,
        }),
        mounted() {
        },
        beforeDestroy() {
        },
        methods: {
            applyColor() {
                let alpha = this.activeColor.substr(7, 9);
                if (alpha.length === 0) alpha = 'ff';
                alpha = (parseInt(alpha, 16) > 68 ? '44' : alpha)
                let color = this.activeColor.substr(0, 7) + alpha;
                console.log(color, alpha);
                this.highlightedCells.forEach(c => c.user.color = color);
            },
            isInCommon(valueType, v) {
                if (this.editableCells.length === 0)
                    return false;
                let first = true;
                let domainString = '';
                let domain = [];
                for (let cell of this.editableCells) {
                    let cellDomain = Array.from(cell.user[valueType]);
                    let cellDomainString = cellDomain.toString();
                    if (cellDomainString !== domainString && !first)
                        return false;
                    else if (first) {
                        first = false;
                        domainString = cellDomainString;
                        domain = cellDomain
                    }
                }
                return domain.includes(v.toString());
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
                if (this.mode === 'colour')
                    this.highlightedCells.forEach(c => c.user.color = null);

                for (let cell of this.editableCells) {
                    if (this.mode !== 'colour') {
                        cell.user[this.mode].clear();
                        this.updateNumbersGrid++;
                    }
                }
            },
            setCellsValue(valueType, v) {
                v = v.toString();
                if (valueType !== 'color') {
                    let isInDomain = this.editableCells?.[0]?.user?.[valueType]?.has(v);

                    for (let cell of this.editableCells) {
                        let collection = cell.user[valueType];
                        if (isInDomain) {
                            collection.delete(v);
                        } else {
                            let maxSize = valueType === 'domain' ?
                                GridCell.maxDomainSize :
                                GridCell.maxPencilMarksSize;
                            if (collection.size < maxSize)
                                collection.add(v);
                        }
                    }

                    this.updateNumbersGrid++;
                    this.$refs.sudoku.focus();
                }
            },
        },
        watch: {},
        computed: {
            ...mapGetters(['editableCells']),
            ...mapState({
                puzzle: state => state.sudoku.puzzle,
                mode: state => state.sudoku.mode,
                highlightedCells: state => state.sudoku.highlightedCells,
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
    }

    .controls {
        display: flex;
        flex-direction: column;
        width: 230px;
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

    .colours {
        gap: 5px 5px;
    }

    .colours >>> .v-color-picker__alpha {
        display: none;
    }

    .colours >>> .v-color-picker__hue {
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