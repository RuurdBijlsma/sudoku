import Vue from 'vue'
import {Puzzle} from "puzzle-solver";
import GridCell from "@/js/GridCell";
import colorString from "color-string";

export default {
    state: {
        puzzle: new Puzzle(),
        selectedCells: [],
        constrainedCells: [],
        constraintCells: [],
        sameCells: [],
        relevantCells: [],
        selected: {
            domain: false,
            setDomain: false,
            pencilMarks: false,
            color: '#ff0000ff',
        },
        dontChange: false,
        visualOptions: {
            constrained: false,
            same: true,
            relevant: true,
            ...(localStorage.getItem('visualOptions') ? JSON.parse(localStorage.visualOptions) : {})
        },
        mode: 'domain',
        box: {x: 0, y: 0, width: 0, height: 0},
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
    },
    mutations: {
        dontChange: (state, dontChange) => state.dontChange = dontChange,
        constraintCells: (state, constraintCells) => state.constraintCells = constraintCells,
        box: (state, box) => state.box = box,
        puzzle: (state, puzzle) => state.puzzle = puzzle,
        mode: (state, mode) => state.mode = mode,
        constrainedCells: (state, constrainedCells) => state.constrainedCells = constrainedCells,
        sameCells: (state, sameCells) => state.sameCells = sameCells,
        relevantCells: (state, relevantCells) => state.relevantCells = relevantCells,
    },
    getters: {
        common: () => (cells, getCell = c => c) => {
            if (cells.length === 0)
                return false;
            let first = true;
            let domainString = '';
            let domain = [];
            for (let cell of cells) {
                let cellDomain = getCell(cell);
                let cellDomainString = cellDomain.toString();
                if (cellDomainString !== domainString && !first)
                    return false;
                else if (first) {
                    first = false;
                    domainString = cellDomainString;
                    domain = cellDomain
                }
            }
            return domain;
        },
        editableCells(state) {
            return state.selectedCells.filter(c => !c.hasSetValue);
        },
        maxDomainLength(state, getters) {
            let max = 0;
            for (let cell of getters.flatGrid)
                if (cell.domain.length > max) max = cell.domain.length;
            return max;
        },
        blockSize(state) {
            let blockConstraint = state.puzzle.constraints.find(c => c.name.includes('Block'));
            return Math.sqrt(blockConstraint.variables.length);
        },
        hasBoxes(state) {
            return !!state.puzzle.constraints.find(c => c.name.includes('Block'));
        },
        width(state, getters) {
            if (!getters.grid[0])
                return;
            return getters.grid[0].length;
        },
        height(state, getters) {
            if (!getters.grid)
                return 0;
            return getters.grid.length;
        },
        flatGrid(state, getters) {
            if (!getters.grid)
                return [];
            return getters.grid.flat();
        },
        grid(state) {
            let visibleCells = state.puzzle.visibleCells;
            if (visibleCells.length === 0)
                return [[]];

            let cells = {};
            let maxX = 0, maxY = 0;
            for (let cell of visibleCells) {
                let [x, y] = cell.split(',').map(n => +n);
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                cells[cell] = new GridCell(
                    x, y,
                    state.puzzle.domains[cell],
                    state.puzzle.pencilMarks[cell],
                    state.puzzle.colors[cell],
                );
            }

            let width = maxX + 1,
                height = maxY + 1;
            return [...Array(height)].map((_, y) => [...Array(width)].map((_, x) => cells[[x, y]]));
        }
    },
    actions: {
        clearCells({state, getters, dispatch}) {
            if (state.mode === 'color')
                state.selectedCells.forEach(c => c.user.color = null);

            for (let cell of getters.editableCells) {
                if (state.mode !== 'color') {
                    cell.user[state.mode].clear();
                    dispatch('updateCellInfo');
                }
            }
        },
        setCellsValue({getters, dispatch}, {type, value, sudokuElement = null}) {
            value = value.toString();
            if (type !== 'color') {
                let isInDomain = getters.editableCells?.[0]?.user?.[type]?.has(value);

                let change = false;
                for (let cell of getters.editableCells) {
                    let collection = cell.user[type];
                    if (isInDomain) {
                        collection.delete(value);
                        change = true;
                    } else {
                        let maxSize = type === 'domain' ?
                            GridCell.maxDomainSize :
                            GridCell.maxPencilMarksSize;
                        if (collection.size < maxSize) {
                            collection.add(value);
                            change = true;
                        }
                    }
                }

                if (change)
                    dispatch('handleInput');
            }
        },
        handleInput({dispatch}) {
            dispatch('updateCellInfo');
            dispatch('updateRelevantCells');
        },
        updateRelevantCells({state, commit, getters}) {
            let commonDomain = getters.common(state.selectedCells, c => Array.from(c.user.domain));
            if (commonDomain.length === 0) {
                commonDomain = getters.common(state.selectedCells, c => c.domain);
                if (commonDomain.length === getters.maxDomainLength) {
                    commit('sameCells', []);
                    commit('relevantCells', []);
                    return;
                }
            }

            let domainString = commonDomain.toString();
            let sameCells = getters.flatGrid.filter(cell => {
                if (state.selectedCells.includes(cell))
                    return false;
                let userDomain = [...cell.user.domain];
                if (userDomain.length === 0) {
                    return domainString === cell.domain.toString();
                }
                return domainString === userDomain.toString();
            });

            let relevantCells = commonDomain.length === 1 ?
                getters.flatGrid.filter(cell => {
                    if (state.selectedCells.includes(cell))
                        return false;
                    let value = commonDomain[0].toString();
                    if (cell.user.domain.has(value))
                        return true;
                    let pencilMarks = cell.hasUserPencilMarks ? [...cell.user.pencilMarks] : cell.pencilMarks.map(p => p.toString());
                    if (!cell.hasValue && pencilMarks.includes(value))
                        return true
                    if (!cell.hasValue && cell.domain.length < getters.maxDomainLength)
                        return cell.domain.map(p => p.toString()).includes(value);
                    return false;
                }) : [];
            relevantCells = relevantCells.filter(c => !sameCells.includes(c))

            commit('sameCells', sameCells);
            commit('relevantCells', relevantCells);
        },
        updateCellInfo({state, getters, dispatch}) {
            state.selected.domain = getters.common(getters.editableCells, c => Array.from(c.user.domain));
            state.selected.setDomain = getters.common(state.selectedCells, c => c.domain);
            state.selected.pencilMarks = getters.common(getters.editableCells, c => Array.from(c.user.pencilMarks));
            let color = getters.common(getters.editableCells, c => c.user.color ?? 'null');
            dispatch('setSelectedColor', color);
        },
        setSelectedColor({state, commit}, color) {
            if (color === false)
                return;
            if (color === null || color === 'null')
                color = 'transparent';
            let [r, g, b, a] = colorString.get.rgb(color);
            a = Math.max(a * 3, 1);
            let newColor = colorString.to.hex([r, g, b, a]);
            if (state.selected.color !== newColor)
                commit('dontChange', true);
            state.selected.color = newColor;
        },
    }
}