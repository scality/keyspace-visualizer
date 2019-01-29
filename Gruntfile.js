module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    grunt.loadNpmTasks('grunt-inline');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        inline: {
            dist: {
                options:{
                    cssmin: true,
                    tag: '',
                    uglify: false
                },
                src: 'index.html',
                dest: 'Keyspace_Visualizer-Offline.html'
            }
        }
    });
    grunt.registerTask('default', ['inline']);
};
