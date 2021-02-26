import { html } from '../../dom.js';
import { getCollections } from '../../api.js';


export async function collectionList(onSelect) {
    const collections = await getCollections();

    return html`
    <ul class="collection-list">
        ${collections.map(collectionLi)}
    </ul>`;

    function collectionLi(name) {
        return html`<li><a href="javascript:void(0)" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;
    }
}

