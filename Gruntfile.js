'use strict';
module.exports = function(grunt) {

    // load all tasks
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });

    var colors = ["blue", "orange", "pink", "green", "purple", "dark_turquoise"];

    var envs = ["demo", "production"];

    // var js_files = [
    //     'libs/jquery/jquery-3.1.1.min.js',
    //     'libs/waypoints/waypoints.min.js',
    //     'libs/animate/animate-css.js',
    //     'libs/jquery-ui/jquery-ui.min.js',
    //     'libs/jquery-ui/jquery.mousewheel-3.0.4.js',
    //     'libs/bootstrap/js/bootstrap.min.js',
    //     'libs/bootstrap/js/bootstrap-hover-dropdown.min.js',
    //     'libs/bootstrap/js/bootstrap-dropdownhover.min.js',
    //     'libs/bootstrap/js/bootstrap-select.min.js',
    //     'libs/imagesloaded/imagesloaded.pkgd.min.js',
    //     'libs/owl-carousel/owl.carousel.min.js',
    //     'libs/masonry/masonry.js',
    //     'libs/waves/js/waves.min.js',
    //     'js/*.js'
    // ];

    var js_files_for_concat = [
        'src/ecom/libs/jquery/jquery-3.1.1.min.js',
        'src/ecom/libs/waypoints/waypoints.min.js',
        'src/ecom/libs/animate/animate-css.js',
        'src/ecom/libs/jquery-ui/jquery-ui.min.js',
        'src/ecom/libs/jquery-ui/jquery.mousewheel-3.0.4.js',
        'src/ecom/libs/bootstrap/js/bootstrap.min.js',
        'src/ecom/libs/bootstrap/js/bootstrap-hover-dropdown.min.js',
        'src/ecom/libs/bootstrap/js/bootstrap-dropdownhover.min.js',
        'src/ecom/libs/bootstrap/js/bootstrap-select.min.js',
        'src/ecom/libs/imagesloaded/imagesloaded.pkgd.min.js',
        'src/ecom/libs/owl-carousel/owl.carousel.min.js',
        'src/ecom/libs/masonry/masonry.js',
        'src/ecom/libs/waves/js/waves.min.js',
        'src/ecom/js/*.js'
    ];

    var sass_files = [];
    colors.forEach(function(color) {
        var tmp = {};
        tmp['dest/' + color + '/css/fonts.css'] = 'src/ecom/sass/fonts.sass';
        tmp['dest/' + color + '/css/main.css'] = 'src/ecom/sass/' + color + '.sass';
        sass_files.push(tmp);
    });

    var copy_files = [];
    colors.forEach(function(color) {
        copy_files.push({
            expand: true,
            cwd: 'src/ecom/',
            src: ['fonts/**'],
            dest: 'dest/' + color + '/'
        });
        copy_files.push({
            expand: true,
            cwd: 'src/ecom/',
            src: ['img/*.{png,jpg}', 'img/img-products/*.{png,jpg}'],
            dest: 'dest/' + color + '/'
        });
        copy_files.push({
            expand: true,
            cwd: 'src/ecom/img/favicon/' + color + '/',
            src: ['**'],
            dest: 'dest/' + color + '/img/favicon/'
        });
        copy_files.push({
            expand: true,
            cwd: 'src/ecom/',
            src: ['libs/**'],
            dest: 'dest/' + color + '/'
        });
        copy_files.push({
            expand: true,
            cwd: 'src/ecom/js/',
            src: 'common.js',
            dest: 'dest/' + color + '/js/'
        });
        copy_files.push({
            expand: true,
            cwd: 'temporary/',
            src: ['js/compressed.min.js'],
            dest: 'dest/' + color + '/'
        });

    });

    var assemble_tasks = {
        options: {
            layout: "default.hbs",
            layoutdir: 'src/ecom/layouts',
            partials: 'src/ecom/partials/**/*.hbs',
            flatten: true
        }
    };
    envs.forEach(function(env) {
        colors.forEach(function(color) {
            assemble_tasks['compile_' + env + '_' + color] = {
                options: {
                    data: 'src/ecom/data/' + env + '/' + color + '/data.json'
                },
                src: ['src/ecom/*.hbs'],
                dest: 'dest/' + color + '/'
            }
        })
    });

    var css_minify_files = [];
    colors.forEach(function(color) {
        css_minify_files.push({
            expand: true,
            cwd: 'dest/' + color + '/css/',
            src: ['*.css', '!*.min.css'],
            dest: 'dest/' + color + '/css/',
            ext: '.min.css'
        });
    });

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dest: ['dest/*', 'dest/**'],
            demo: ['demo/*', 'demo/**'],
            css: ['css/*', 'css/**'],
            temporary: ['temporary/'],
            build: ['build/']
        },

        sass: {
            options: {
                sourceMap: false
            },
            compile_css: {
                files: sass_files
            }
        },
        copy: {
            copy_files: {
                files: copy_files
            },
            copy_demo: {
                files: [{
                    expand: true,
                    cwd: 'src/demo',
                    src: 'index.html',
                    dest: 'dest'
                }, {
                    expand: true,
                    cwd: 'src/demo',
                    src: '.htaccess',
                    dest: 'dest'
                }, {
                    expand: true,
                    cwd: 'src/',
                    src: ['!demo/index.html', '!demo/.htaccess', 'demo/css/**', 'demo/img/**'],
                    dest: 'dest'
                }]
            }
        },
        assemble: assemble_tasks,

        watch: {
            sass: {
                files: ['src/sass/*.sass'],
                tasks: ['compile'],
                options: {
                    reload: true
                }
            }
        },
        concat: {
            dist: {
                src: js_files_for_concat,
                dest: 'temporary/js/compressed.js'
            }
        },
        uglify: {
            build: {
                src: 'temporary/js/compressed.js',
                dest: 'temporary/js/compressed.min.js'
            }
        },
        cssmin: {
            minify: {
                files: css_minify_files
            }
        },
        compress: {
            build: {
                options: {
                    archive: 'build/ecom-<%= pkg.version %>.zip'
                },
                files: [{
                    src: ['docs/**']
                }, {
                    src: ['licenses/**']
                }, {
                    src: ['dest/**']
                }, {
                    src: ['src/**']
                }, {
                    src: ['Gruntfile.js']
                }, {
                    src: ['package.json']
                }]
            }
        }
    });

    //Loading tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-assemble');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //Tasks
    // grunt.registerTask('compile', ['clean:css', 'sass:change']);

    grunt.registerTask('minify_js', ['concat', 'uglify']);


    grunt.registerTask('build_prod', function() {
        grunt.task.run('clean:build');
        grunt.task.run('clean:dest');
        grunt.task.run('clean:temporary');
        grunt.task.run('minify_js');
        grunt.task.run('sass');
        grunt.task.run('cssmin');
        grunt.task.run('copy');

        colors.forEach(function(color) {
            grunt.task.run('assemble:compile_production_' + color);
        });

        grunt.task.run('clean:temporary');
        grunt.task.run('compress');
    });



    grunt.registerTask('build_demo', function() {
        grunt.task.run('clean:build');
        grunt.task.run('clean:dest');
        grunt.task.run('clean:temporary');
        grunt.task.run('minify_js');
        grunt.task.run('sass');
        grunt.task.run('cssmin');
        grunt.task.run('copy');

        colors.forEach(function(color) {
            grunt.task.run('assemble:compile_demo_' + color);
        });

        grunt.task.run('clean:temporary');
        grunt.task.run('compress');
    });



    // Default task
    grunt.registerTask('build', ['build_demo']);
    grunt.registerTask('default', ['build_prod']);
};
