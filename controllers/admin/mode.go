//管理员管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"strings"
	"tsEngine/tsCrypto"
	"tsEngine/tsDb"
	"tsEngine/tsString"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/validation"
)

type ModeController struct {
	controllers.BaseController
}

//模块列表
func (this *ModeController) List() {

	this.CheckPermission()

	Keyword := this.GetString("Keyword")

	o := models.Mode{}

	items, err := o.List(Keyword)

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.Result = items
	this.TraceJson()

}

//模块添加
func (this *ModeController) Add() {
	this.CheckRoot() //校验是否为开发者

	o := models.Mode{}
	o.Name = this.GetString("Name")
	o.Type, _ = this.GetInt64("Type")
	if o.Type == 0 {
		o.Type = 1
	}
	o.Key = strings.ToLower(this.GetString("Key"))
	o.ParentId, _ = this.GetInt64("ParentId")
	if o.ParentId == 0 {
		o.ParentId = -1
	}
	o.Logs, _ = this.GetInt64("Logs")
	o.Description = this.GetString("Description")
	o.Md5 = tsCrypto.GetMd5([]byte(o.Key))

	//****************************************************
	//数据验证
	valid := validation.Validation{}
	valid.Range(int(o.Type), 1, 3, "Type").Message("模块类型错误[1,2,3]")
	valid.Required(o.Name, "Name").Message("模块名称不能为空")
	valid.MaxSize(o.Name, 200, "NameMax").Message("客户名称不能大于200个字符")

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
	db.Transaction()
	defer db.TransactionEnd()

	var pData models.Mode
	if o.ParentId > 0 {
		pData.Id = o.ParentId
		db.DbRead(&pData)
		o.Md5 = tsCrypto.GetMd5([]byte(pData.Key + o.Key))
		o.Type = 3
	}

	_, err := db.DbInsert(&o)
	if err != nil {
		db.SetRollback(true)
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}

	if o.ParentId == -1 {

		var data1 models.Mode
		data1.Name = "添加"
		data1.Type = 3
		data1.Key = "add"
		data1.Md5 = tsCrypto.GetMd5([]byte(o.Key + "add"))
		data1.Logs = 1
		data1.ParentId = o.Id

		var data2 models.Mode
		data2.Name = "编辑"
		data2.Type = 3
		data2.Key = "edit"
		data2.Md5 = tsCrypto.GetMd5([]byte(o.Key + "edit"))
		data2.Logs = 1
		data2.ParentId = o.Id

		var data3 models.Mode
		data3.Name = "删除"
		data3.Type = 3
		data3.Key = "del"
		data3.Md5 = tsCrypto.GetMd5([]byte(o.Key + "del"))
		data3.Logs = 1
		data3.ParentId = o.Id

		var data4 models.Mode
		data4.Name = "列表"
		data4.Type = 3
		data4.Key = "list"
		data4.Md5 = tsCrypto.GetMd5([]byte(o.Key + "list"))
		data4.Logs = 2
		data4.ParentId = o.Id

		var data5 models.Mode
		data5.Name = "查看"
		data5.Type = 3
		data5.Key = "view"
		data5.Md5 = tsCrypto.GetMd5([]byte(o.Key + "view"))
		data5.Logs = 2
		data5.ParentId = o.Id

		var temp []models.Mode
		temp = append(temp, data1)
		temp = append(temp, data2)
		temp = append(temp, data3)
		temp = append(temp, data4)
		temp = append(temp, data5)

		err = db.DbInsertMulti(temp, 5)
		if err != nil {
			db.SetRollback(true)
			beego.Error(err)
			this.Code = models.DbError
			this.Result = err
			this.TraceJson()
		}

	}

	this.Code = models.SuccessProto

	this.TraceJson()

}

//模块编辑
func (this *ModeController) Edit() {
	this.CheckRoot() //校验是否为开发者

	//初始化
	db := tsDb.NewDbBase()
	o := models.Mode{}

	//获取get数据
	o.Id = tsString.ToInt64(this.Ctx.Input.Param("0"))
	if o.Id > 0 {
		err := db.DbGet(&o)
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "没有该客户"
			this.TraceJson()
		}

		this.Code = 1
		this.Result = o
		this.TraceJson()
	}

	//获取post数据
	o.Id, _ = this.GetInt64("Id")
	err := db.DbGet(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "没有找到该记录"
		this.TraceJson()
	}

	o.Name = this.GetString("Name")
	o.Type, _ = this.GetInt64("Type")
	o.Key = strings.ToLower(this.GetString("Key"))
	o.ParentId, _ = this.GetInt64("ParentId")
	if o.ParentId == 0 {
		o.ParentId = -1
	}
	o.Logs, _ = this.GetInt64("Logs")
	o.Description = this.GetString("Description")
	o.Md5 = tsCrypto.GetMd5([]byte(o.Key))

	//****************************************************
	//数据验证
	valid := validation.Validation{}
	valid.Range(int(o.Type), 1, 3, "Type").Message("模块类型错误[1,2,3]")
	valid.Required(o.Name, "Name").Message("模块名称不能为空")
	valid.MaxSize(o.Name, 200, "NameMax").Message("客户名称不能大于200个字符")

	if valid.HasErrors() {
		// 如果有错误信息，证明验证没通过
		// 打印错误信息
		for _, err := range valid.Errors {
			this.Code = 0
			this.Msg = err.Message
			this.TraceJson()
		}

	}

	var pData models.Mode
	if o.ParentId > 0 {
		pData.Id = o.ParentId
		db.DbRead(&pData)
		o.Md5 = tsCrypto.GetMd5([]byte(pData.Key + o.Key))
		o.Type = 3
	}

	err = db.DbUpdate(&o, "Name", "Type", "Key", "Md5", "Logs", "Description")
	if err != nil {
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.TraceJson()

}

//模块删除
func (this *ModeController) Del() {
	this.CheckRoot() //校验是否为开发者

	db := tsDb.NewDbBase()
	db.Transaction()
	defer db.TransactionEnd()

	o := models.Mode{}
	o.Id, _ = this.GetInt64("Id")
	if o.Id <= 0 {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	err := db.DbRead(&o)
	if err != nil {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}

	//先删除所有子节点
	err = db.DbDel(&o, "ParentId", o.Id)
	if err != nil {
		db.SetRollback(true)
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}
	//再删除主节点
	err = db.DbDel(&o)

	if err != nil {
		db.SetRollback(true)
		beego.Error(err)
		this.Code = models.DbError
		this.Result = err
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.TraceJson()

}
