import {Puzzle} from "puzzle-solver";


onmessage = ({data: [action, ...params]}) => {
    let result;

    switch (action) {
        case 'solve':
            result = solve(...params);
            break;
        case 'enforceConsistency':
            result = enforceConsistency(...params);
            break;
        default:
            throw new Error("Action doesn't exist");
    }

    postMessage(result);
};

function enforceConsistency(puzzleObj) {
    console.log("Enforce");
    let puzzle = Puzzle.fromJSON(puzzleObj);
    return puzzle.consistentDomains;
}

function solve(puzzleObj, solutions) {
    console.log('solve');
    let puzzle = Puzzle.fromJSON(puzzleObj);
    let result = puzzle.solve(solutions);
    for (let step of result.steps)
        delete step['csp'];
    return result;
}