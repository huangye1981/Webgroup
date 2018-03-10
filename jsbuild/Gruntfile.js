module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {

 	admin_js: {
        options: {
          separator: '\n;\n',
          stripBanners: true,
          banner: '/*! admin - v1.0.0 - 2016-12-4 */'
        },
        src: [
			'src/admin/Config.js',
			'src/admin/controller/*.js',
			'src/admin/directive/*.js',
			'src/admin/factory/*.js',
			'src/admin/filter/*.js',
			'src/admin/service/*.js'
		],
        dest: '../static/js/admin.js'
      },
	 app_js: {
        options: {
          separator: '\n;\n',
          stripBanners: true,
          banner: '/*! framework - v1.0.0 - 2016-12-4 */'
        },
         src: [
			'src/app/Config.js',
			'src/app/controller/*.js',
			'src/app/directive/*.js',
			'src/app/factory/*.js',
			'src/app/filter/*.js',
			'src/app/service/*.js'
		],
        dest: '../static/js/app.js'
      }
    },
    uglify: {
      admin: {
        src: '../static/js/admin.js',
        dest: '../static/js/admin.min.js'
	  },
	  app: {
        src: '../static/js/app.js',
        dest: '../static/js/app.min.js'
	  }

    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  // 默认任务
  grunt.registerTask('default', ['concat', 'uglify']);
}