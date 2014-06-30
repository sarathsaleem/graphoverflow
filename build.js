({
    baseUrl: 'GO/js',
    paths: {
        knockout: 'libs/knockout',
        d3: 'libs/d3'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    },
    name: 'app',
    out: "GO/js/app-min.js"
})
