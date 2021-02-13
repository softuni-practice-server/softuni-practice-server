const MIN_DELAY = 1;
const MAX_DELAY = 3;

function delay(fn) {
    const time = MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY));

    return (...params) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(fn(...params));
                } catch (err) {
                    reject(err);
                }
            }, time);
        });
    };
}

module.exports = delay;