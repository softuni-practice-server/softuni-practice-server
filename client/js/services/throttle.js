import { html } from '../dom.js';
import { getThrottling, setThrottling } from '../api.js';


export async function throttlePanel(display) {
    const active = await getThrottling();

    return html`
    <p>
        Request throttling: </span>${active}</span>
        <button @click=${(ev) => set(ev, true)}>Enable</button>
        <button @click=${(ev) => set(ev, false)}>Disable</button>
    </p>`;

    async function set(ev, state) {
        ev.target.disabled = true;
        await setThrottling(state);
        display();
    }
}