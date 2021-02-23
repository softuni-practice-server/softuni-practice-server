const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const jsonPlugin = require('@rollup/plugin-json');

export default {
    input: 'index.js',
    output: {
        name: 'Server',
        file: 'server.js',
        format: 'umd'
    },
    plugins: [
        commonjs(),

        nodeResolve(),

        jsonPlugin()
    ],
    external: 'http'
};