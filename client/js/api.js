const api = {
    async get(url) {
        return json(url);
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