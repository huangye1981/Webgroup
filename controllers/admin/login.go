//Ip屏蔽管理
package admin

import (
	"Webgroup/controllers"
	"Webgroup/models"
	"fmt"
	"tsEngine/tsCrypto"
	"tsEngine/tsDb"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/astaxie/beego"
)

type LoginController struct {
	controllers.BaseController
}

//登录
func (this *LoginController) Login() {

	password_key := beego.AppConfig.String("PasswordKey")

	oAdmin := models.Admin{}
	oAdmin.Username = this.GetString("Username")
	oAdmin.Password = tsCrypto.GetMd5([]byte(this.GetString("Password") + password_key))

	db := tsDb.NewDbBase()
	//如果是开发者账号
	if oAdmin.Username == beego.AppConfig.String("Username") {

		if oAdmin.Password != beego.AppConfig.String("Password") {
			this.Code = 0
			this.Msg = "登录密码错误"
			this.TraceJson()
		}

		oAdmin.Id, _ = beego.AppConfig.Int64("Uid")
		oAdmin.Username = beego.AppConfig.String("Username")
		oAdmin.Password = beego.AppConfig.String("Password")
		oAdmin.Name = beego.AppConfig.String("Name")
		oAdmin.Email = beego.AppConfig.String("Email")
		oAdmin.Photo = beego.AppConfig.String("Photo")
	} else {

		err := db.DbRead(&oAdmin, "Username", "Password")
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "用户名或密码错误"
			this.TraceJson()
		}
		//非开发者时候记录登录时间和IP
		oAdmin.LoginTime = tsTime.CurrSe()
		oAdmin.LoginIp = this.Ctx.Request.RemoteAddr
		//更新用户登录时间不是关键数据不需要判断错误
		db.DbUpdate(&oAdmin, "LoginTime", "LoginIp")
	}

	//设置登录Cookie
	this.Ctx.SetCookie("LoginId", fmt.Sprintf("%d", oAdmin.Id), 0, "/")

	//获取节点和角色
	oNav, oRole, err := controllers.GetNavPermission(oAdmin)
	if err != nil {
		this.Code = 0
		this.Msg = "数据库异常错误"
		this.TraceJson()
	}

	this.Code = 1
	this.Result = map[string]interface{}{"Admin": oAdmin, "Nav": oNav, "Role": oRole}
	this.TraceJson()

}

//退出
func (this *LoginController) Logout() {
	//设置登录Cookie
	this.Ctx.SetCookie("LoginId", "0", -1, "/")
	this.Code = 1
	this.TraceJson()

}

//检测登录状态
func (this *LoginController) IsLogin() {

	login_id := tsString.ToInt64(this.Ctx.GetCookie("LoginId"))
	if login_id == 0 {
		this.Code = models.NoLogin
		this.TraceJson()
	}

	var oAdmin models.Admin
	oAdmin.Id = login_id

	db := tsDb.NewDbBase()

	//校验是否是开发者
	uid, _ := beego.AppConfig.Int64("Uid")

	if login_id == uid {
		oAdmin.Id, _ = beego.AppConfig.Int64("Uid")
		oAdmin.Username = beego.AppConfig.String("Username")
		oAdmin.Password = beego.AppConfig.String("Password")
		oAdmin.Name = beego.AppConfig.String("Name")
		oAdmin.Email = beego.AppConfig.String("Email")
		oAdmin.Photo = beego.AppConfig.String("Photo")
	} else {
		err := db.DbRead(&oAdmin)
		if err != nil {
			beego.Error(err)
			this.Code = 0
			this.Msg = "数据库错误"
			this.TraceJson()
		}
		if oAdmin.Username == "" {
			this.Code = 0
			this.Msg = "用户未登陆"
			this.TraceJson()
		}

	}

	//获取节点和权限
	oNav, oRole, err := controllers.GetNavPermission(oAdmin)
	if err != nil {
		this.Code = 0
		this.Msg = "数据库错误"
		this.TraceJson()
	}

	this.Code = models.SuccessProto
	this.Result = map[string]interface{}{"Admin": oAdmin, "Nav": oNav, "Role": oRole}
	this.TraceJson()

}
