package controllers

import (
	"Webgroup/models"
	"encoding/json"
	_ "strconv"
	"strings"
	"tsEngine/tsCrypto"
	"tsEngine/tsDb"
	"tsEngine/tsString"
	"tsEngine/tsTime"

	"github.com/antonholmquist/jason"
	"github.com/astaxie/beego"
	"github.com/beego/i18n"
)

type BaseController struct {
	beego.Controller
	i18n.Locale
	Code    int
	Msg     string
	Result  interface{}
	AdminId int64
}

var langTypes []string // Languages that are supported.

func init() {
	beego.Trace("初始化控制器")
	//获取语言包列表
	langTypes = strings.Split(beego.AppConfig.String("LangTypes"), "|")

	//载入语言包
	for _, lang := range langTypes {
		beego.Trace("载入语言包: " + lang)
		if err := i18n.SetMessage(lang, "static/i18n/"+"locale_"+lang+".ini"); err != nil {
			beego.Error("错误载入:", err)
			return
		}
	}

}

func (this *BaseController) Display(tpl string, layout bool) {

	this.Data["Version"] = beego.AppConfig.String("Version")

	if beego.AppConfig.String("runmode") == "dev" {
		this.Data["Version"] = tsTime.CurrSe()
	}

	this.Data["Appname"] = beego.AppConfig.String("AppName")
	this.Data["Website"] = beego.AppConfig.String("WebSite")
	this.Data["Weburl"] = beego.AppConfig.String("WebUrl")
	this.Data["Email"] = beego.AppConfig.String("Email")
	if layout {
		this.Layout = "layout/main.html"
	}
	this.TplName = tpl + ".html"
}

//json 输出
func (this *BaseController) TraceJson() {
	this.Data["json"] = &map[string]interface{}{"Code": this.Code, "Msg": this.Msg, "Data": this.Result}
	this.ServeJSON()
	this.StopRun()
}

//登录判断
func (this *BaseController) CheckLogin(redirect ...bool) {

	this.AdminId = tsString.ToInt64(this.Ctx.GetCookie("LoginId"))

	if this.AdminId == 0 {
		if len(redirect) > 0 {
			if redirect[0] {
				this.Ctx.Redirect(302, "/login")
				return
			}
		}

	}

}

//权限判断
func (this *BaseController) CheckPermission() {

	params := strings.Split(strings.ToLower(this.Ctx.Request.RequestURI), "/")

	//登录校验
	this.CheckLogin()
	//如果是开发者直接返回
	uid, _ := beego.AppConfig.Int64("Uid")
	if this.AdminId == uid {
		return
	}

	//ip检测
	this.CheckIp()

	var oAdmin models.Admin
	oAdmin.Id = this.AdminId

	db := tsDb.NewDbBase()
	db.DbRead(&oAdmin)

	if oAdmin.Username == "" {
		this.Code = 0
		this.Msg = "登陆超时"
		this.TraceJson()
	}
	this.AdminId = oAdmin.Id

	ids := strings.Split(oAdmin.Role, ",")
	var oRole models.Role

	list, err := db.DbInIds(&oRole, "Id", ids)
	if err != nil {
		this.Code = 0
		this.Msg = "数据库操作异常，请联系管理员"
		this.TraceJson()
	}
	pass := 0
	for _, v := range list {

		permission := v["Permission"].(string)
		if permission == "" {
			permission = "{}"
		}
		temp, _ := jason.NewObjectFromBytes([]byte(permission))

		temp, err := temp.GetObject(params[2])
		if err != nil {
			continue
		}
		value, err := temp.GetBoolean(params[3])
		//beego.Trace(value)
		if err != nil || !value {
			continue
		}
		pass = 1
		break
	}

	md5 := tsCrypto.GetMd5([]byte(params[2] + params[3]))

	var oMode models.Mode
	oMode.Md5 = md5

	db.DbRead(&oMode, "Md5")

	if oMode.Logs == 1 {
		beego.Trace("参数", this.Ctx.Request.PostForm)

		content, _ := json.Marshal(this.Ctx.Request.PostForm)

		//记录操作日志
		var oLogs models.Logs
		oLogs.Mode = oMode.ParentId
		oLogs.Action = oMode.Id
		oLogs.AdminId = oAdmin.Id
		oLogs.Pass = pass
		oLogs.CreateTime = tsTime.CurrSe()
		oLogs.Content = string(content)

		db := tsDb.NewDbBase()
		db.DbInsert(&oLogs)
	}

	if pass == 1 {
		return
	}
	this.Code = 0
	this.Msg = "权限不足"
	this.TraceJson()

}

//校验是否为开发者
func (this *BaseController) CheckRoot() {

	this.AdminId = tsString.ToInt64(this.Ctx.GetCookie("LoginId"))

	if this.AdminId == 0 {

		this.Code = models.NoLogin
		this.TraceJson()
	}

	uid, _ := beego.AppConfig.Int64("Uid")
	if this.AdminId != uid {
		this.Code = 0
		this.Msg = "权限不足"
		this.TraceJson()
	}
}

//IP过滤判断
func (this *BaseController) CheckIp() {

	ip := this.Ctx.Request.Header.Get("X-Forwarded-For")
	//ip过滤
	var oIpban models.Ipban

	db := tsDb.NewDbBase()

	list, err := db.DbList(&oIpban, "Ip", ip)
	if err != nil {
		beego.Error(err)
		this.Code = 0
		this.Msg = "数据库操作异常，请联系管理员"
		this.TraceJson()
	}

	//获取秒级时间戳
	now_time := tsTime.CurrSe()

	for _, v := range list {
		if v["Start"].(uint64) < now_time && v["End"].(uint64) > now_time {
			this.Code = 0
			this.Msg = "您的IP已被屏蔽，不可以访问"
			this.TraceJson()
		}
	}

}

//获取节点和权限
func GetNavPermission(oAdmin models.Admin) (oNav interface{}, oRole interface{}, err error) {

	db := tsDb.NewDbBase()

	//校验是否是开发者
	uid, _ := beego.AppConfig.Int64("Uid")
	if oAdmin.Id == uid {
		oNode := models.Node{}
		oNav, _ = db.DbList(&oNode)
		oRole = "root"
		return oNav, oRole, nil
	}

	ids := strings.Split(oAdmin.Role, ",")

	if len(ids) > 0 {

		var role models.Role
		role_list, err := db.DbInIds(&role, "Id", ids)

		if err != nil {
			return oNav, oRole, err
		}

		if len(role_list) > 0 {

			temp := ""
			for _, v := range role_list {
				if v["Node"].(string) != "" {
					temp += v["Node"].(string) + ","
				}
			}
			if temp != "" {
				var oNode models.Node
				list, err := db.DbInIds(&oNode, "Id", strings.Split(temp, ","))
				if err != nil {
					return oNav, oRole, err
				}

				temp = ""
				for _, v := range list {
					if v["ParentTree"].(string) != "" {
						temp += v["ParentTree"].(string) + ","
					}
				}

				if temp != "" {

					oNav, err = db.DbInIds(&oNode, "Id", strings.Split(temp, ","))
					if err != nil {
						return oNav, oRole, err
					}
				}
			}
			//设置权限数据
			oRole = role_list
		}

	}
	return oNav, oRole, nil

}
