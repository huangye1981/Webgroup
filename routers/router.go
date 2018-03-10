package routers

import (
	"Webgroup/controllers"
	"Webgroup/controllers/admin"

	"github.com/astaxie/beego"
)

func init() {

	beego.AutoRouter(&controllers.DomainController{})
	beego.AutoRouter(&controllers.FilesController{})
	beego.AutoRouter(&controllers.GrabController{})
	/*********************系统路由********************************/

	beego.Router("/", &admin.IndexController{})

	// 登录
	beego.AutoPrefix("admin", &admin.LoginController{})

	// 节点
	beego.AutoPrefix("admin", &admin.NodeController{})

	// 模块管理
	beego.AutoPrefix("admin", &admin.ModeController{})

	// 管理员
	beego.AutoPrefix("admin", &admin.AdminController{})

	// 角色
	beego.AutoPrefix("admin", &admin.RoleController{})

	// ip屏蔽
	beego.AutoPrefix("admin", &admin.IpbanController{})

	// 日志
	beego.AutoPrefix("admin", &admin.LogsController{})

	//公共
	beego.AutoPrefix("admin", &admin.PublicController{})

	//Uedit富文本编辑器
	beego.AutoPrefix("admin", &admin.UeditorController{})

}
