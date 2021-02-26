//import page from '//unpkg.com/page/page.mjs';
import { html, render, until } from './dom.js';
import { collectionList } from './services/editor/collection.js';
import { recordTable } from './services/editor/record.js';
import { throttlePanel } from './services/throttle.js';


function start() {
    const main = document.querySelector('main');
    editor(main);
}

async function editor(main) {
    let list = html`<div class="col">Loading&hellip;</div>`;
    let viewer = html`<div class="col">
    <p>Select collection to view records</p>
</div>`;
    display();

    list = html`<div class="col">${await collectionList(onSelect)}</div>`;
    display();

    async function display() {
        render(html`
        <section class="layout">
            ${until(throttlePanel(display), html`<p>Loading</p>`)}
        </section>
        <section class="layout">
            ${list}
            ${viewer}
        </section>`, main);
    }

    async function onSelect(ev, name) {
        ev.preventDefault();
        viewer = html`<div class="col">${await recordTable(name)}</div>`;
        display();
    }
}

start();