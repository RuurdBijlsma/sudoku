import {Puzzle} from "puzzle-solver";
import GridCell from "@/js/GridCell";
import colorString from "color-string";
import toWords from 'split-camelcase-to-words';
import {getConsistentDomain, solve} from "@/js/WorkerSolve";

export default {
    state: {
        puzzle: new Puzzle(),
        selectedCells: [],
        constrainedFromSelection: [],
        selectedConstraint: null,
        sameCells: [],
        relevantCells: [],
        editingConstraint: null,
        watchSolvability: 0,
        solvability: {
            solveWorkers: [],
            consistencyWorkers: [],
            result: null,
            consistentDomains: null,
        },
        selected: {
            domain: false,
            setDomain: false,
            pencilMarks: false,
            color: '#ff0000ff',
        },
        dontChange: false,
        options: {
            autoSolve: true,
            constrained: false,
            same: true,
            relevant: true,
            solution: false,
            consistentDomains: false,
            ...(localStorage.getItem('puzzleOptions') ? JSON.parse(localStorage.puzzleOptions) : {})
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
        selectedCells: (state, selectedCells) => state.selectedCells = selectedCells,
        consistentDomains: (state, consistentDomains) => state.solvability.consistentDomains = consistentDomains,
        solvabilityResult: (state, result) => state.solvability.result = result,
        watchSolvability: state => state.watchSolvability++,
        unwatchSolvability: state => state.watchSolvability--,
        editingConstraint: (state, editingConstraint) => state.editingConstraint = editingConstraint,
        dontChange: (state, dontChange) => state.dontChange = dontChange,
        selectedConstraint: (state, selectedConstraint) => state.selectedConstraint = selectedConstraint,
        box: (state, box) => state.box = box,
        puzzle: (state, puzzle) => state.puzzle = puzzle,
        mode: (state, mode) => state.mode = mode,
        constrainedFromSelection: (state, constrainedFromSelection) => state.constrainedFromSelection = constrainedFromSelection,
        sameCells: (state, sameCells) => state.sameCells = sameCells,
        relevantCells: (state, relevantCells) => state.relevantCells = relevantCells,
    },
    getters: {
        isSolved: state => !!state.solvability.result,
        solvable: (state) => {
            let solutionCount = state.solvability.result?.solutions?.length ?? 0;
            return solutionCount === 0 ? 'no' : solutionCount === 1 ? 'unique' : 'yes';
        },
        constraintTypes: () => Puzzle.constraintTypes,
        constraintTypeNames: (state, getters) => Object.keys(getters.constraintTypes).reduce((a, b) => {
            a[b] = toWords(b);
            return a
        }, {}),
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
        gridToPuzzle({state, getters}) {
            let puzzle = state.puzzle.copy();
            let grid = getters.flatGrid;
            for (let cell of grid) {
                let key = [cell.x, cell.y].toString();
                let userDomain = [...cell.user.domain].map(n => isNaN(+n) ? n : +n);
                let setDomain = [...cell.domain];
                let userPencilMarks = [...cell.user.pencilMarks].map(n => isNaN(+n) ? n : +n);
                let setPencilMarks = cell.pencilMarks;
                let userColor = cell.user.color;
                let setColor = cell.color;
                let domain = userDomain.length === 0 ? setDomain : userDomain;
                let pencilMarks = userPencilMarks.length === 0 ? setPencilMarks : userPencilMarks;
                let color = userColor ?? setColor;
                puzzle.domains[key] = domain;
                if (color && color !== 'transparent')
                    puzzle.colors[key] = color;
                if (pencilMarks.length > 0)
                    puzzle.pencilMarks[key] = pencilMarks;
            }
            return puzzle;
        },
        clearCells({state, getters, dispatch}) {
            if (state.mode === 'color')
                state.selectedCells.forEach(c => c.user.color = null);

            for (let cell of getters.editableCells) {
                if (state.mode !== 'color') {
                    cell.user[state.mode].clear();
                    dispatch('updateCellInfo');
                }
            }
            dispatch('handleInput');
        },
        setCellsValue({getters, dispatch}, {type, value}) {
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
        handleInput({state, dispatch, commit}) {
            dispatch('updateCellInfo');
            dispatch('updateRelevantCells');
            if (state.watchSolvability > 0 && state.options.autoSolve)
                dispatch('updateSolvability');
            else
                commit('solvabilityResult', null);
            if (state.watchSolvability > 0 && state.options.consistentDomains)
                dispatch('updateConsistentDomains');
            else
                commit('consistentDomains', null);

        },
        stopSolving({state, commit}) {
            let workers = state.solvability.solveWorkers;
            workers.forEach(w => w.abort());
            workers.splice(0, workers.length);
            commit('solvabilityResult', null);
        },
        async updateSolvability({state, commit, dispatch}) {
            let workers = state.solvability.solveWorkers;
            workers.forEach(w => w.abort());
            let abort = new AbortController();
            workers.push(abort);

            let result = await solve(await dispatch('gridToPuzzle'), 2, abort.signal);
            if (!abort.signal.aborted)
                commit('solvabilityResult', result);

            workers.splice(workers.indexOf(abort), 1);
        },
        async updateConsistentDomains({state, commit, dispatch}) {
            let workers = state.solvability.consistencyWorkers;
            workers.forEach(w => w.abort());
            let abort = new AbortController();
            workers.push(abort);

            let result = await getConsistentDomain(await dispatch('gridToPuzzle'), abort.signal);
            if (!abort.signal.aborted)
                commit('consistentDomains', result);

            workers.splice(workers.indexOf(abort), 1);
        },
        updateRelevantConstraints({state, commit, getters}) {
            if (state.selectedCells.length === 0 || state.selectedCells.length > 21)
                return commit('constrainedFromSelection', []);

            let hCells = state.selectedCells.map(c => [c.x, c.y].toString());
            let constraintsOnCell = {};
            for (let hCell of hCells) {
                [...new Set(
                    state.puzzle.usableConstraints
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
            let constrained = [];
            for (let key in constraintsOnCell)
                if (constraintsOnCell[key] === hCells.length) {
                    let [x, y] = key.split(',').map(n => +n);
                    constrained.push(getters.grid[y][x]);
                }
            commit('constrainedFromSelection', constrained);
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