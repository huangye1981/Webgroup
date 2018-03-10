//角色管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"fmt"
	"strconv"
	"strings"
	"tsEngine/tsDb"
	"tsEngine/tsString"

	"github.com/astaxie/beego"
)

type RoleController struct {
	controllers.BaseController
}

//类似构造函数
func (this *RoleController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//角色列表
func (this *RoleController) List() {

	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Role{}

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

//角色信息
func (this *RoleController) View() {

	role_id, err := strconv.ParseInt(this.Ctx.Input.Param("0"), 10, 64)
	if err != nil {
		beego.Error(err)
		this.Code = models.ParamError
		this.Result = err
		this.TraceJson()
	}

	//初始化对象
	var oRole models.Role
	oRole.Id = role_id
	db := tsDb.NewDbBase()
	err = db.DbRead(&oRole)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	var oMode models.Mode

	//通过偏移量获取数据
	list, err := db.DbList(&oMode)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	this.Result = map[string]interface{}{"Role": oRole, "Mode": list}

	this.Code = models.SuccessProto

	this.TraceJson()

}

//角色编辑
func (this *RoleController) Add() {

	o := models.Role{}

	o.Name = this.GetString("Name")
	if o.Name == "" {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	o.Permission = this.GetString("Permission")

	if o.Permission == "" {
		o.Permission = "{}"
	}

	o.Description = this.GetString("Description")

	db := tsDb.NewDbBase()
	_, err := db.DbInsert(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()

}

//角色编辑
func (this *RoleController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Role{}

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
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	o.Name = this.GetString("Name")
	if o.Name == "" {
		this.Code = models.ParamError
		this.TraceJson()
	}

	o.Permission = this.GetString("Permission")

	if o.Permission == "" {
		o.Permission = "{}"
	}

	o.Description = this.GetString("Description")

	err := db.DbUpdate(&o, "Name", "Permission", "Description")
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()

}

//角色删除
func (this *RoleController) Del() {

	//初始化对象
	var oRole models.Role
	oRole.Id, _ = this.GetInt64("Id")
	if oRole.Id == 0 {

		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	db := tsDb.NewDbBase()

	oAdmin := models.Admin{}

	count, _ := db.DbCount(&oAdmin, "Role__icontains", fmt.Sprintf(",%d,", oRole.Id))
	if count > 0 {

		this.Code = 0
		this.Result = "角色正在使用中，不可以删除"
		this.TraceJson()
	}

	err := db.DbDel(&oRole)
	if err != nil {
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()

}

//权限编辑
func (this *RoleController) Permission() {

	id, err := this.GetInt64("Id")
	if err != nil {
		beego.Error(err)
		this.Code = models.ParamError
		this.Result = err
		this.TraceJson()
	}
	//获取权限数据，并转换成小写规则

	permission := strings.ToLower(this.GetString("Permission"))

	var oRole models.Role
	oRole.Id = id

	oRole.Permission = permission
	db := tsDb.NewDbBase()
	err = db.DbUpdate(&oRole, "Permission")
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()
}

//权限编辑
func (this *RoleController) Node() {

	db := tsDb.NewDbBase()
	id, err := this.GetInt64("Id")
	if err != nil {
		beego.Error(err)
		this.Code = models.ParamError
		this.Result = err
		this.TraceJson()
	}
	node := this.GetString("Node")
	system := this.GetString("System")

	var oRole models.Role
	oRole.Id = id

	oRole.Node = node
	oRole.System = system

	err = db.DbUpdate(&oRole, "Node", "System")
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	this.Code = models.SuccessProto
	this.TraceJson()
}
