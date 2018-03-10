module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {

 	css: {
        options: {
          separator: '\n\n',
          stripBanners: true,
          banner: '/*! css - v1.2.3 - 2014-2-4 */'
        },
        src: [
          'src/framework/ui-select-0.10.0/select.css',
          'src/framework/angular-datetime-picker/jquery.datetimepicker.css',
          'src/framework/ez-confirm/ez-confirm.min.css',
		  'src/framework/zyupload/zyupload-1.0.0.css',
          'src/css/fileupload.css'
        ],
        dest: '../static/css/plug.css'
      },


	 framework_js: {
        options: {
          separator: '\n;\n',
          stripBanners: true,
          banner: '/*! framework - v1.0.0 - 2016-12-4 */'
        },
        src: [
          'src/framework/jquery-1.7.2.js',
          'src/framework/jquery-3.0.0/jquery.fullscreen.js',
          'src/framework/jquery-3.0.0/jquery.base64.js',
          'src/framework/jquery-ui-1.11.4/jquery-ui.js',
          'src/framework/jquery-3.0.0/jquery.slimscroll.js',
          'src/framework/jquery-3.0.0/jquery.fileinput.js',
          'src/framework/flot-0.8.3/jquery.flot.js',
          'src/framework/flot-0.8.3/jquery.flot.time.js',
          'src/framework/flot-0.8.3/jquery.flot.pie.js',
          'src/framework/zyupload/zyupload.tailor-1.0.0.js',
          'src/framework/angular-1.3.0.14/angular.js',
          'src/framework/angular-1.3.0.14/angular-animate.js',
          'src/framework/angular-1.3.0.14/angular-route.js',
          'src/framework/angular-1.3.0.14/angular-sanitize.js',
          'src/framework/angular-1.3.0.14/angular-cookies.js',
          'src/framework/angular-1.3.0.14/angular-md5.js',
          'src/framework/angular-ueditor1_4_3_3/ueditor.config.js',
          'src/framework/angular-ueditor1_4_3_3/ueditor.all.js',
          'src/framework/angular-ueditor1_4_3_3/angular-ueditor.js',
          'src/framework/angular-datetime-picker/jquery.datetimepicker.js',
          'src/framework/ng-table-1.0.0/ng-table.min.js',
          'src/framework/ng-currency/ng-currency.min.js',
          'src/framework/bootstrap-3.0.0/js/bootstrap.min.js',
		  'src/framework/bootstrap-3.0.0/js/bootstrap-slider.js',
          'src/framework/bootstrap-3.0.0/js/ui-bootstrap-tpls-0.11.0.js',
          'src/framework/angular-ui-tree-2.1.5/angular-ui-tree.min.js',
          'src/framework/angular-xeditable-0.1.8/xeditable.min.js',
          'src/framework/ui-select-0.10.0/select.min.js',
          'src/framework/ez-confirm/ez-confirm.min.js',
          'src/framework/ez-confirm/ez-confirm-tpl.js',
		  'src/framework/public/imageupload.js',
          'src/framework/public/function.js'
        ],
        dest: '../static/js/framework.js'
      },

	 admin_js: {
        options: {
          separator: '\n;\n',
          stripBanners: true,
          banner: '/*! admin - v1.0.0 - 2016-12-4 */'
        },
        src: [
			'src/admin/Language.js',
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
      framework: {
        src: '../static/js/framework.js',
        dest: '../static/js/framework.min.js'
      },
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