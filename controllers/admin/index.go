package admin

import (
	"Webgroup/controllers"

	"github.com/astaxie/beego"
)

type IndexController struct {
	controllers.BaseController
}

//类似构造函数
func (this *IndexController) Prepare() {

	beego.Trace("管理员初始化")

}

//默认网站首页
func (this *IndexController) Get() {

	this.Display("index", false)

}
