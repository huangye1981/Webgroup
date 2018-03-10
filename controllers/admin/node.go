//节点管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"fmt"
	"tsEngine/tsDb"
	"tsEngine/tsString"

	"github.com/astaxie/beego"
)

type NodeController struct {
	controllers.BaseController
}

//类似构造函数
func (this *NodeController) Prepare() {
	//权限判断
	this.CheckPermission()

}

//节点列表
func (this *NodeController) List() {

	o := models.Node{}
	db := tsDb.NewDbBase()
	list, _ := db.DbList(&o)

	this.Code = models.SuccessProto
	this.Result = list
	this.TraceJson()

}

//节点添加
func (this *NodeController) Add() {

	//获取post数据
	o := models.Node{}
	o.Name = this.GetString("Name")
	if o.Name == "" {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	o.Url = this.GetString("Url")
	o.Icon = this.GetString("Icon")
	o.Sort, _ = this.GetInt64("Sort")
	o.Description = this.GetString("Description")

	o.ParentId, _ = this.GetInt64("ParentId")
	if o.ParentId == 0 {
		o.ParentId = -1
	}

	o.ParentTree = ",-1,"

	db := tsDb.NewDbBase()
	db.Transaction()
	defer db.TransactionEnd()

	if o.ParentId > 0 {
		var oNode models.Node
		oNode.Id = o.ParentId
		db.DbRead(&oNode)
		o.ParentTree = oNode.ParentTree
	}
	_, err := db.DbInsert(&o)
	if err != nil {
		db.SetRollback(true)
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常"
		beego.Trace()
	}

	//更新ParentTree，链接自身的Id
	o.ParentTree += fmt.Sprintf("%d,", o.Id)
	err = db.DbUpdate(&o, "ParentTree")
	if err != nil {
		db.SetRollback(true)
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常"
		beego.Trace()
	}

	this.Code = models.SuccessProto

	this.TraceJson()

}

//节点编辑
func (this *NodeController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Node{}

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
	if o.Id <= 0 {
		this.Code = models.ParamError
		this.Msg = "参数错误"
		this.TraceJson()
	}

	o.Name = this.GetString("Name")
	if o.Name == "" {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	o.Url = this.GetString("Url")
	o.Icon = this.GetString("Icon")
	o.Sort, _ = this.GetInt64("Sort")
	o.Description = this.GetString("Description")

	err := db.DbUpdate(&o, "Name", "Url", "Icon", "Sort", "Description")

	if err != nil {
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
	}

	this.Code = models.SuccessProto
	this.Result = o
	this.TraceJson()

}

//节点删除
func (this *NodeController) Del() {

	db := tsDb.NewDbBase()
	o := models.Node{}
	o.Id, _ = this.GetInt64("Id")

	err := db.DbDel(&o, "ParentTree__icontains", fmt.Sprintf(",%d,", o.Id))

	if err != nil {
		beego.Error(err)
		this.Code = models.DbError
		this.Msg = "数据库异常"
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()

}
