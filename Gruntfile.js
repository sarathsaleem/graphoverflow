module.exports = function (grunt) {


    var env = "development";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        graphList: grunt.file.readJSON('graphoverflow/js/graph/model/graph-list.json'),
        // options for index.html builder task
        index: {
            graphTmpl: 'graphoverflow/graphs/__graph.html',
            graphFullScreenTmpl: 'graphoverflow/graphs/__graph-fullscreen.html',
            indexTmpl: 'graphoverflow/graphs/__index.html',
            contetnSrc: 'graphoverflow/templates' // source template file
        },
        tester: {
            options: {
                banner: '© Sarath Saleem , license : https://github.com/sarathsaleem/graphoverflow#LICENSE\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['graphoverflow/**'],
                tasks: ['default'],
                options: {
                    spawn: false,
                },
            },
        },
        uglify: {
            my_target: {
                options: {
                    banner: '/*\n© Sarath Saleem , license : https://github.com/sarathsaleem/graphoverflow#LICENSE \n\n Knockout JavaScript library v2.3.0 \n (c) Steven Sanderson - http://knockoutjs.com/ \n License: MIT (http://www.opensource.org/licenses/mit-license.php) */\n',
                    preserveComments : false
                },
                files: {
                    'graphoverflow/js/app-min.js': ['graphoverflow/js/app-min.js']
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'graphoverflow/js',
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
                    name: 'app',
                    out: "graphoverflow/js/app-min.js",
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
            tmpl = grunt.file.read(conf.graphTmpl),
            tmplFullScreen = grunt.file.read(conf.graphFullScreenTmpl);

        graphList.forEach(function (graph) {
            var fileName = graph.htmlTitle || graph.id,
                contentPath = conf.contetnSrc + '/' + graph.id + '.html',
                loadScreenPath = conf.contetnSrc + '/' + graph.id + '-loadscreen.html',
                graphContent = grunt.file.read(contentPath),
                title = graph.title,
                template = graph.tmpl === 'fullscreen' ? tmplFullScreen : tmpl,
                loadScreen = '';
            if (graph.tmpl === 'fullscreen') {
                loadScreen = grunt.file.read(loadScreenPath);
            }

            grunt.file.write('graphoverflow/graphs/' + fileName + '.html', grunt.template.process(template, {
                data: {
                    "graphId": graph.id,
                    "graphContent": graphContent,
                    "loadScreen": loadScreen,
                    "title": title,
                    "thumbnail": graph.thumbnail,
                    "description": graph.description,
                    "twitter": graph.twitter,
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

        grunt.file.write('graphoverflow/index.html', grunt.template.process(tmpl, {
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

    grunt.registerTask("minifyApp", "Minify App", function () {
        grunt.task.run('requirejs');
    });

    grunt.registerTask("minifyProjects", "Minify Projects", function () {

        var graphList = grunt.config('graphList').graphList;
        var completed = 8;

        function setConfig(graph) {
            grunt.config('requirejs.compile', {
                options: {
                    paths: {
                        knockout: 'libs/knockout',
                        d3: 'libs/d3',
                        jquery: 'libs/jquery'
                    },
                    baseUrl: 'graphoverflow/js',
                    name: "graph/render/" + graph.id,
                    // include: ["graph/render/g9"],
                    //insertRequire: ['graph/render/g9'],
                    out: "graphoverflow/js/builds/" + graph.id + "-min.js",
                    optimize: "uglify",
                    done: function (done, output) {
                        done();
                        completed++;
                        if (graphList[completed]) {
                            setConfig(graphList[completed]);
                        }
                    }
                }
            });
            grunt.task.run(['requirejs']);
        }
        setConfig(graphList[completed]);
    });



    //Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');



    // Default task(s).
    grunt.registerTask('default', ['development', 'graphs', 'index']);
    grunt.registerTask('test-build', ['production', 'graphs', 'index']);
    grunt.registerTask('build', ['production', 'graphs', 'index', 'minifyApp', 'minifyProjects', 'uglify']);

};

//build cmd

//node r.js -o build.js optimize=none

//
