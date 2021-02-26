export default {
    input: './client/js/app.js',
    output: {
        name: 'Client',
        file: './dist/client.js',
        format: 'es'
    },
    external: ['lit-html', 'page']
};