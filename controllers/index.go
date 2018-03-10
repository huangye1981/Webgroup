package controllers

import (
	_ "Webgroup/models"
	"strings"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
)

type IndexController struct {
	BaseController
}

//类似构造函数
func (this *IndexController) Prepare() {

}

func getUrlData(i int) {
	curl := httplib.Get("https://www.baidu.com")
	curl.Bytes()
	beego.Trace(i)
}

//默认网站首页
func (this *IndexController) Get() {

	for i := 0; i < 200; i++ {
		go func() {
			getUrlData(i)
		}()
	}

	referer := this.Ctx.Request.Referer()
	ip := this.Ctx.Input.IP()
	beego.Trace(ip)
	if referer == "" {
		beego.Error("没有来源地址")
		this.Ctx.WriteString("没有来源地址")
	}
	//过滤掉http或https头
	referer = strings.Replace(referer, "https://", "", -1)
	referer = strings.Replace(referer, "http://", "", -1)

	ref := strings.Split(referer, "/")
	this.Redirect("http://www.baidu.com", 302)
	beego.Trace(ref)
	this.Data["type"] = "index"
	this.Display("index", true)

}

//默认网站首页
func (this *IndexController) Test() {

	this.Ctx.WriteString("ok")

}
