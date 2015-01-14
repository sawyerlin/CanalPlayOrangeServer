module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        parallel: {
            guard : {
                options: {
                    stream: true
                },
                tasks: [
                    { cmd: 'guard' },
                    { cmd: 'nodemon' },
                    { cmd: 'chromium-browser', args: ['http://localhost:5000/logapi/canal']}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-parallel');
    grunt.registerTask('default', ['parallel']);
}
