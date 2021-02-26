import { html } from '../dom.js';
import { getThrottling } from '../api.js';


export async function throttlePanel() {
    const active = await getThrottling();

    return html`
    <p>Request throttling: </span>${active}</span></p>`;
}