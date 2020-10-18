import Vue from 'vue'
import {Puzzle} from "puzzle-solver";
import GridCell from "@/js/GridCell";

export default {
    state: {
        puzzle: new Puzzle(),
        highlightedCells: [],
        mode: 'domain',
    },
    mutations: {
        puzzle: (state, puzzle) => state.puzzle = puzzle,
        mode: (state, mode) => state.mode = mode,
    },
    getters: {
        editableCells(state) {
            return state.highlightedCells.filter(c => !c.hasSetValue);
        },
        maxDomainLength(state, getters) {
            let max = 0;
            for (let cell of getters.flatGrid)
                if (cell.domain.length > max) max = cell.domain.length;
            return max;
        },
        blockSize(state) {
            let blockConstraint = state.puzzle.constraints.find(c => c.name.includes('Block'));
            return Math.sqrt(blockConstraint.cells.length);
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
    actions: {}
}