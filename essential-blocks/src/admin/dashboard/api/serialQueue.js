/**
 * FIFO queue with concurrency 1.
 *
 * Each task starts only after the previous one settled (fulfilled or
 * rejected). push() resolves with the task's own value; a task that throws
 * or rejects resolves to `fallback` instead, so the queue never rejects.
 *
 * Kept free of imports and of React so it can be shared without cycles.
 *
 * @return {{push: Function, size: number}} Queue.
 */
export function createSerialQueue() {
    let tail = Promise.resolve();
    let size = 0;

    return {
        push(task, fallback) {
            size++;
            const run = () =>
                Promise.resolve()
                    .then(task)
                    .catch(() => fallback)
                    .finally(() => {
                        size--;
                    });
            const request = tail.then(run, run);
            tail = request;
            return request;
        },
        get size() {
            return size;
        },
    };
}
