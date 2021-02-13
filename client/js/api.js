function ep(strings, ...params) {
    return '/' + strings.join('');
}

export async function getCollections() {
    return await (await fetch(ep`data`)).json();
}