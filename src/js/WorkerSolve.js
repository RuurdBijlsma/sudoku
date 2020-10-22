import Worker from 'worker-loader!./solve-worker.js';

export async function solve(puzzle, solutions = 1, abortSignal) {
    return new Promise(resolve => {
        const worker = new Worker();
        abortSignal?.addEventListener?.('abort', () => resolve(worker.terminate()), {once: true});
        worker.postMessage(['solve', puzzle.copy(), solutions]);
        worker.onmessage = e => {
            resolve(e.data);
            worker.terminate();
        }
    });
}

export async function getConsistentDomain(puzzle, abortSignal) {
    return new Promise(resolve => {
        const worker = new Worker();
        abortSignal?.addEventListener?.('abort', () => resolve(worker.terminate()), {once: true});
        worker.postMessage(['enforceConsistency', puzzle.copy()]);
        worker.onmessage = e => {
            resolve(e.data);
            worker.terminate();
        }
    });
}