import { html } from '../../dom.js';
import { getRecords } from '../../api.js';

export async function recordTable(collectionName) {
    const records = await getRecords(collectionName);
    const layout = getLayout(records);

    return html`
    <table>
        <caption>${collectionName}</caption>
        <thead>
            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>
        </thead>
        <tbody>
            ${records.map(r => recordRow(r, layout))}
        </tbody>
    </table>`;
}

function getLayout(records) {
    const result = new Set(['_id']);
    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));

    return [...result.keys()];
}

function recordRow(record, layout) {
    return html`
    <tr>
        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}
    </tr>`;
}