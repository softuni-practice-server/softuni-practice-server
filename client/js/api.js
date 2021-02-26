const api = {
    async get(url) {
        return json(url);
    },
    async post(url, body) {
        return json(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }
};

async function json(url, options) {
    return await (await fetch('/' + url, options)).json();
}

export async function getCollections() {
    return api.get('data');
}

export async function getRecords(collection) {
    return api.get('data/' + collection);
}

export async function getThrottling() {
    return api.get('util/throttle');
}

export async function setThrottling(throttle) {
    return api.post('util', { throttle });
}