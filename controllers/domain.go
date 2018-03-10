//域名管理
package controllers

import (
	"Webgroup/models"
	"time"
	"tsEngine/tsDb"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
	"github.com/astaxie/beego/validation"
)

type DomainController struct {
	BaseController
}

//类似构造函数
func (this *DomainController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//检测
func (this *DomainController) Check() {

	api := "http://vip.weixin139.com/weixin/qq1782882732.php?domain=www.baidu.com"
	//创建链接
	curl := httplib.Get(api)

	//设置超时时间 2秒链接，3秒读数据
	curl.SetTimeout(5*time.Second, 5*time.Second)

	//获取请求的内容
	temp, err := curl.Bytes()
	if err != nil {
		beego.Error(err)
	}

	content := string(temp)

	this.Code = models.SuccessProto
	this.Result = content
	this.TraceJson()

}

//屏蔽IP列表
func (this *DomainController) List() {

	beego.Trace(models.Depth)
	models.Depth = true
	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Domain{}

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

func (this *DomainController) Add() {

	o := models.Domain{}
	o.Domain = this.GetString("Domain")
	o.Note = this.GetString("Note")
	o.Sort, _ = this.GetInt64("Sort")
	o.Time = tsTime.CurrSe()

	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Domain, "Domain").Message("域名不能为空")

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

func (this *DomainController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Domain{}

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
	o.Domain = this.GetString("Domain")
	o.Sort, _ = this.GetInt64("Sort")
	o.Note = this.GetString("Note")

	//****************************************************
	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Domain, "Domain").Message("域名不能为空")

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
	err := db.DbUpdate(&o, "Domain", "Note", "Sort")

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

func (this *DomainController) Del() {

	o := models.Domain{}
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
