import page from '//unpkg.com/page/page.mjs';
import { html, render } from './dom.js';

const main = document.querySelector('main');
const view = html`<h1>Hello there</h1>`;
render(view, main);