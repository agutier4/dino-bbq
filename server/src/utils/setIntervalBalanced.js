import logger from '../config/logger';

/**
 * setIntervalBalanced
 *
 * Configure a function interval after a fixed offset
 * Prevents intervals with the same frequency being called at once.
 */
const setIntervalBalanced = async (fn, frequencyMs) => {
    if (typeof fn !== 'function') {
        logger.error(`Attempted to set an interval callback ${fn} that is not a function!`);
        return;
    }

    // Compute a random offset for the interval based on the frequency
    // The random offset has a range of 0.0 - intervalMs
    // This prevents interval functions with the same frequency from overlapping
    //
    // An example with four functions, with overlapping intervals:
    // Without randomization:
    // fn1 (5s): |----|----|----|----| ...
    // fn2 (5s): |----|----|----|----| ...
    // fn3 (3s): |--|--|--|--|--|--|-- ...
    // fn4 (3s): |--|--|--|--|--|--|-- ...
    //
    // With randomization:
    // fn1 (5s): ---|----|----|----|----| ...
    // fn2 (5s): |----|----|----|----|--- ...
    // fn3 (3s): -|--|--|--|--|--|--|--|- ...
    // fn4 (3s): |--|--|--|--|--|--|--|-- ...
    //
    const randomIntervalOffset = Math.floor(Math.random() * frequencyMs);

    // Setup a timeout that registers the interval after the random offset
    // Uses a promise to return the intervalId so it can later be cancelled.
    const intervalPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const intervalId = setInterval(() => {
                fn();
            }, frequencyMs);

            resolve(intervalId);
        }, randomIntervalOffset);
    });
    return intervalPromise;
};

export default setIntervalBalanced;
