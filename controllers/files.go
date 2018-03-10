//域名管理
package controllers

import (
	"Webgroup/models"
	"fmt"
	"strings"
	"tsEngine/tsDb"
	"tsEngine/tsFile"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/validation"
)

var (
	template = `
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>%s</title>
		<meta name="keywords" content="%s">
		<meta name="description" content="%s">
		</head>
		<body>
		%s
		</body>
		</html>
	`
)

type FilesController struct {
	BaseController
}

//类似构造函数
func (this *FilesController) Prepare() {
	//权限判断
	this.CheckPermission()
}

//软文列表
func (this *FilesController) List() {

	Keyword := this.GetString("Keyword")
	Page, _ := this.GetInt64("Page")
	PageSize, _ := this.GetInt64("PageSize")

	o := models.Files{}

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

func (this *FilesController) Add() {

	o := models.Files{}
	o.Title = this.GetString("Title")
	o.Keywords = this.GetString("Keywords")
	o.Description = this.GetString("Description")
	o.Href = this.GetString("Href")
	if o.Href != "" && !strings.Contains(o.Href, "http://") && !strings.Contains(o.Href, "https://") {
		o.Href = "http://" + o.Href
	}
	o.Content = this.GetString("Content")
	o.Note = this.GetString("Note")
	o.Sort, _ = this.GetInt64("Sort")
	o.Time = tsTime.CurrSe()

	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Title, "Title").Message("标题不能为空")
	valid.Required(o.Href, "Href").Message("跳转地址不能为空")
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

	html := fmt.Sprintf(template, o.Title, o.Keywords, o.Description, o.Content)
	path := fmt.Sprintf("./static/files/%d_1.html", o.Id)
	tsFile.WriteFile(path, html)

	photo := this.GetString("Photo")

	if len(photo) > 255 {
		temp := fmt.Sprintf("%d", o.Id)
		filename, _ := tsFile.WriteImgFile2("./static/files/img/", temp, photo)
		img_html := `<img src="` + filename + `">`
		if o.Href != "" {
			img_html = fmt.Sprintf(`<a  href="%s"> %s </a>`, o.Href, img_html)
		}
		html = fmt.Sprintf(template, o.Title, o.Keywords, o.Description, img_html)
		path = fmt.Sprintf("./static/files/%d_2.html", o.Id)
		tsFile.WriteFile(path, html)
	}

	this.Code = 1
	this.Result = o
	this.TraceJson()
}

func (this *FilesController) Edit() {

	//初始化
	db := tsDb.NewDbBase()
	o := models.Files{}

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
	o.Title = this.GetString("Title")
	o.Keywords = this.GetString("Keywords")
	o.Description = this.GetString("Description")
	o.Href = this.GetString("Href")
	if o.Href != "" && !strings.Contains(o.Href, "http://") && !strings.Contains(o.Href, "https://") {
		o.Href = "http://" + o.Href
	}
	o.Content = this.GetString("Content")
	o.Note = this.GetString("Note")
	o.Sort, _ = this.GetInt64("Sort")
	//****************************************************
	//数据验证
	valid := validation.Validation{}

	valid.Required(o.Title, "Title").Message("标题不能为空")
	valid.Required(o.Href, "Href").Message("跳转地址不能为空")

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
	err := db.DbUpdate(&o, "Title", "Keywords", "Description", "Href", "Content", "Note", "Sort")

	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "参数错误或没有任何修改"
		this.TraceJson()
	}
	html := fmt.Sprintf(template, o.Title, o.Keywords, o.Description, o.Content)
	path := fmt.Sprintf("./static/files/%d_1.html", o.Id)
	tsFile.WriteFile(path, html)

	photo := this.GetString("Photo")

	if len(photo) > 255 {
		temp := fmt.Sprintf("%d", o.Id)
		filename, _ := tsFile.WriteImgFile2("./static/files/img/", temp, photo)

		img_html := `<img src="` + filename + `">`
		if o.Href != "" {
			img_html = fmt.Sprintf(`<a  href="%s"> %s </a>`, o.Href, img_html)
		}

		html = fmt.Sprintf(template, o.Title, o.Keywords, o.Description, img_html)
		path = fmt.Sprintf("./static/files/%d_2.html", o.Id)
		tsFile.WriteFile(path, html)
	}
	this.Code = 1
	this.Result = o
	this.TraceJson()

}

func (this *FilesController) Del() {

	o := models.Files{}
	o.Id, _ = this.GetInt64("Id")
	db := tsDb.NewDbBase()
	err := db.DbRead(&o)
	if err != nil {
		this.Code = 0
		this.Msg = "参数错误"
		this.TraceJson()
	}
	id := o.Id
	err = db.DbDel(&o)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库异常错误，请联系管理员"
		this.TraceJson()
	}
	path_1 := fmt.Sprintf("./static/files/%d_1.html", id)
	path_2 := fmt.Sprintf("./static/files/%d_2.html", id)
	path_3 := fmt.Sprintf("./static/files/img/%d.png", id)
	beego.Trace(path_1)
	tsFile.DelFile(path_1) //删除文件
	tsFile.DelFile(path_2) //删除文件
	tsFile.DelFile(path_3) //删除文件
	this.Code = 1
	this.TraceJson()

}
