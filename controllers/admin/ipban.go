//Ip屏蔽管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"tsEngine/tsDb"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/validation"
)

type IpbanController struct {
	controllers.BaseController
}

//类似构造函数
func (this *IpbanController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//屏蔽IP列表
func (this *IpbanController) List() {

	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Ipban{}

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

func (this *IpbanController) Add() {

	o := models.Ipban{}
	o.Ip = this.GetString("Ip")
	o.Start = tsTime.StringToSe(this.GetString("Start"), 2)
	o.End = tsTime.StringToSe(this.GetString("Start"), 2)
	o.Description = this.GetString("Description")
	o.AdminId = this.AdminId
	o.CreateTime = tsTime.CurrSe()
	o.UpdateTime = o.CreateTime

	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Ip, "Ip").Message("IP不能为空")

	if valid.HasErrors() {
		// 如果有错误信息，证明验证没通过
		// 打印错误信息
		for _, err := range valid.Errors {
			this.Code = 0
			this.Msg = err.Message
			this.TraceJson()
		}

	}

	db := tsDb.NewDbBase()
	_, err := db.DbInsert(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库操作异常，请联系管理员"
		this.TraceJson()
	}

	this.Code = 1
	this.Result = o
	this.TraceJson()
}

func (this *IpbanController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Ipban{}

	//获取get数据
	o.Id = tsString.ToInt64(this.Ctx.Input.Param("0"))
	if o.Id > 0 {
		err := db.DbGet(&o)
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "没有该记录"
			this.TraceJson()
		}

		this.Code = 1
		this.Result = o
		this.TraceJson()
	}

	//获取post数据
	o.Id, _ = this.GetInt64("Id")
	o.Ip = this.GetString("Ip")

	o.Description = this.GetString("Description")
	o.Start = tsTime.StringToSe(this.GetString("Start"), 2)
	o.End = tsTime.StringToSe(this.GetString("End"), 2)

	//****************************************************
	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Ip, "Ip").Message("IP不能为空")

	if valid.HasErrors() {
		// 如果有错误信息，证明验证没通过
		// 打印错误信息
		for _, err := range valid.Errors {
			this.Code = 0
			this.Msg = err.Message
			this.TraceJson()
		}

	}

	//****************************************************
	err := db.DbUpdate(&o, "IP", "Description", "Start", "End")

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "参数错误或没有任何修改"
		this.TraceJson()
	}

	this.Code = 1
	this.Result = o
	this.TraceJson()

}

func (this *IpbanController) Del() {

	o := models.Ipban{}
	o.Id, _ = this.GetInt64("Id")
	db := tsDb.NewDbBase()
	err := db.DbRead(&o)
	if err != nil {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	err = db.DbDel(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = 1
	this.TraceJson()

}
