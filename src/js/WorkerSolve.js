import Worker from 'worker-loader!./solve-worker.js';
let solveWorker = new Worker();
let consistencyWorker = new Worker();


export async function solve(puzzle, solutions = 1, abortSignal) {
    const stopWorker=()=>{
        solveWorker.terminate();
        solveWorker = new Worker();
    }
    return new Promise(resolve => {
        abortSignal?.addEventListener?.('abort', () => resolve(stopWorker()), {once: true});
        solveWorker.postMessage(['solve', puzzle.copy(), solutions]);
        solveWorker.onmessage = e => {
            console.log("Terminating solveWorker");
            stopWorker();
            resolve(e.data);
        }
    });
}

export async function getConsistentDomain(puzzle, abortSignal) {
    const stopWorker=()=>{
        consistencyWorker.terminate();
        consistencyWorker = new Worker();
    }
    return new Promise(resolve => {
        abortSignal?.addEventListener?.('abort', () => resolve(stopWorker()), {once: true});
        consistencyWorker.postMessage(['enforceConsistency', puzzle.copy()]);
        consistencyWorker.onmessage = e => {
            stopWorker();
            resolve(e.data);
        }
    });
}