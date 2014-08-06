module.exports = function (grunt) {


    var env = "development";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        graphList: grunt.file.readJSON('GO/js/graph/model/graph-list.json'),
        // options for index.html builder task
        index: {
            graphTmpl: 'GO/graphs/__graph.tmpl',
            indexTmpl: 'GO/graphs/__index.tmpl',
            contetnSrc: 'GO/templates' // source template file
        },
        tester: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['GO/**'],
                tasks: ['default'],
                options: {
                    spawn: false,
                },
            },
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'GO/js',
                    paths: {
                        knockout: 'libs/knockout',
                        d3: 'libs/d3',
                        jquery: 'libs/jquery'
                    },
                    shim: {
                        d3: {
                            exports: 'd3'
                        }
                    },
                    wrap: {
                        "start": '/*\n\n<%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> (https://github.com/sarathsaleem/graphoverflow)\n    By  \n<%= pkg.author.name %> \n\n*/\n\n\n',
                        "end": ""
                    },
                    name: 'app',
                    out: "GO/js/app-min.js",
                    optimize: "none"
                }
            }
        }
    });

    /*
     *
     * Generated graphs files from graph list.
     * file name will we from htmltitle attr or id
     *
     */

    grunt.registerTask("graphs", "Generate graph pages", function () {
        var conf = grunt.config('index'),
            graphList = grunt.config('graphList').graphList,
            tmpl = grunt.file.read(conf.graphTmpl);

        graphList.forEach(function (graph) {
            var fileName = graph.htmlTitle || graph.id,
                contentPath = conf.contetnSrc + '/' + graph.id + '.html',
                graphContent = grunt.file.read(contentPath),
                title = graph.title;

            grunt.file.write('GO/graphs/' + fileName + '.html', grunt.template.process(tmpl, {
                data: {
                    "graphId": graph.id,
                    "graphContent": graphContent,
                    "title": title,
                    "thumbnail": graph.thumbnail,
                    "description": graph.description,
                    "env": env
                }
            }));
            grunt.log.writeln('Generated : ' + fileName + '.html');
        });

    });

    grunt.registerTask("index", "Generate index page", function () {
        var conf = grunt.config('index'),
            tmpl = grunt.file.read(conf.indexTmpl),
            graphList = grunt.config('graphList').graphList;

        graphList.map(function (graph) {
            graph.tags = graph.tags.join(' ');
            return graph;
        });

        grunt.file.write('GO/index.html', grunt.template.process(tmpl, {
            data: {
                "env": env,
                "graphs": graphList
            }
        }));
        grunt.log.writeln('Generated : index.html');
    });

    grunt.registerTask("development", "Set env to development", function () {
        env = "development";
    });

    grunt.registerTask("production", "Set env to production", function () {
        env = "production";
    });



    //Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');



    // Default task(s).
    grunt.registerTask('default', ['development', 'graphs', 'index']);
    grunt.registerTask('build', ['production', 'graphs', 'index', 'requirejs']);

};

//build cmd

//node r.js -o build.js optimize=none

//
