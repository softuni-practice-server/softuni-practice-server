const fs = require('fs');

const html = fs.readFileSync('./client/index.html', 'utf-8');
const client = fs.readFileSync('./dist/client.js', 'utf-8');

const bundle = html.replace('<script type="module" src="js/app.js"></script>', `<script type="module">\n${client}\n</script>`);
fs.writeFileSync('./dist/bundle.json', JSON.stringify(bundle));


const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const jsonPlugin = require('@rollup/plugin-json');


export default {
    input: 'index.js',
    output: {
        name: 'Server',
        file: './dist/server.js',
        format: 'umd'
    },
    plugins: [
        commonjs(),

        nodeResolve(),

        jsonPlugin()
    ],
    external: 'http'
};