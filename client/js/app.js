import page from '//unpkg.com/page/page.mjs';
import { html, render } from './dom.js';
import { getCollections } from './api.js';


async function start() {
    const main = document.querySelector('main');

    const collections = await getCollections();

    const view = html`
    <div>
        <h1>Collections</h1>
        <ul>
            ${collections.map(c => html`<li>${c}</li>`)}
        </ul>
    </div>`;

    render(view, main);
}

start();