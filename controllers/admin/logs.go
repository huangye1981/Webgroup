package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"tsEngine/tsDb"

	"github.com/astaxie/beego"
)

type LogsController struct {
	controllers.BaseController
}

//类似构造函数
func (this *LogsController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//默认网站首页
func (this *LogsController) List() {

	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Logs{}

	items, pagination, err := o.List(Page, PageSize, Keyword)

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.Result = map[string]interface{}{"Items": items, "Pagination": pagination}
	this.TraceJson()

}

//默认网站首页
func (this *LogsController) Clear() {

	//初始化对象
	var oLogs models.Logs
	db := tsDb.NewDbBase()
	err := db.DbDel(&oLogs, "Id__gt", "0")
	if err != nil {
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}

	this.Code = models.SuccessProto

	this.TraceJson()

}
