import { html } from '../dom.js';
import { getCollections } from '../api.js';


export async function collectionList(onSelect) {
    const collections = await getCollections();

    return html`
    <ul>
        ${collections.map(collectionLi)}
        <li><button>Create collection</button></li>
    </ul>`;

    function collectionLi(name) {
        return html`<li>${name} <button @click=${() => onSelect(name)}>View</button></li>`;
    }
}

